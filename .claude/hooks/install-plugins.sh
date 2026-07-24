#!/bin/bash
# SessionStart hook: make the plugins declared in .claude/settings.json work
# in Claude Code on the web. Cloud containers start fresh without the declared
# marketplace plugins, and the web harness only loads skills from
# ~/.claude/skills — this hook installs whatever settings.json declares and
# symlinks the installed plugin skills into that directory. Nothing here is
# specific to any plugin: add or remove entries in enabledPlugins /
# extraKnownMarketplaces and the hook follows. When everything is already
# installed (e.g. local sessions), it exits in milliseconds.
set -u

command -v claude >/dev/null 2>&1 || exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
settings="$project_dir/.claude/settings.json"
[ -f "$settings" ] || exit 0

# Emit one line per enabled plugin: "<plugin-id>\t<marketplace>\t<repo>\t<sparse-paths>".
# repo/sparse come from the marketplace's extraKnownMarketplaces entry (github
# sources); both are empty for marketplaces the CLI already knows on its own.
parse_settings() {
  if command -v node >/dev/null 2>&1; then
    node -e '
      const s = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
      const markets = s.extraKnownMarketplaces || {};
      for (const [id, enabled] of Object.entries(s.enabledPlugins || {})) {
        if (!enabled) continue;
        const marketplace = id.slice(id.lastIndexOf("@") + 1);
        const src = (markets[marketplace] || {}).source || {};
        const repo = src.source === "github" && src.repo ? src.repo : "";
        const sparse = (src.sparsePaths || []).join(" ");
        console.log([id, marketplace, repo, sparse].join("\t"));
      }
    ' "$settings"
  elif command -v jq >/dev/null 2>&1; then
    jq -r '
      (.extraKnownMarketplaces // {}) as $markets
      | (.enabledPlugins // {}) | to_entries[] | select(.value)
      | .key as $id
      | ($id | split("@") | last) as $marketplace
      | ($markets[$marketplace].source // {}) as $src
      | (if $src.source == "github" then ($src.repo // "") else "" end) as $repo
      | [$id, $marketplace, $repo, (($src.sparsePaths // []) | join(" "))]
      | @tsv
    ' "$settings"
  fi
}

installed=$(claude plugin list 2>/dev/null || true)
added_marketplaces=" "

while IFS=$'\t' read -r plugin marketplace repo sparse; do
  [ -n "$plugin" ] || continue
  case "$installed" in *"$plugin"*) continue ;; esac
  if [ -n "$repo" ]; then
    case "$added_marketplaces" in
      *" $marketplace "*) ;;
      *)
        if [ -n "$sparse" ]; then
          # $sparse is intentionally unquoted: a space-separated path list
          claude plugin marketplace add "$repo" --sparse $sparse >/dev/null 2>&1 || true
        else
          claude plugin marketplace add "$repo" >/dev/null 2>&1 || true
        fi
        added_marketplaces="$added_marketplaces$marketplace "
        ;;
    esac
  fi
  if claude plugin install "$plugin" >/dev/null 2>&1; then
    echo "Installed plugin: $plugin"
  else
    echo "Failed to install plugin: $plugin" >&2
  fi
done < <(parse_settings)

# The web harness loads skills only from ~/.claude/skills (where claude.ai
# account skills are synced) and ignores the plugin cache, so expose each
# installed plugin skill there via symlink.
skills_dir="$HOME/.claude/skills"
mkdir -p "$skills_dir"
for skill in "$HOME"/.claude/plugins/cache/*/*/*/skills/*/; do
  [ -f "${skill}SKILL.md" ] || continue
  name=$(basename "$skill")
  [ -e "$skills_dir/$name" ] || ln -s "${skill%/}" "$skills_dir/$name"
done

exit 0
