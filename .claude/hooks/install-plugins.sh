#!/bin/bash
# Claude Code on the web containers start fresh and don't auto-install the
# marketplace plugins declared in .claude/settings.json, so slash commands
# like /shape-idea are missing in cloud sessions. This SessionStart hook
# installs any missing plugin; when everything is already installed (e.g.
# local sessions) it exits in milliseconds.
set -u

command -v claude >/dev/null 2>&1 || exit 0

installed=$(claude plugin list 2>/dev/null || true)
added_marketplaces=""

# ensure <plugin>@<marketplace> <marketplace-name> <marketplace-add-args...>
ensure() {
  local plugin="$1" marketplace="$2"
  shift 2
  case "$installed" in
    *"$plugin"*) return 0 ;;
  esac
  case "$added_marketplaces" in
    *" $marketplace "*) ;;
    *)
      claude plugin marketplace add "$@" >/dev/null 2>&1 || true
      added_marketplaces="$added_marketplaces $marketplace "
      ;;
  esac
  if claude plugin install "$plugin" >/dev/null 2>&1; then
    echo "Installed plugin: $plugin"
  else
    echo "Failed to install plugin: $plugin" >&2
  fi
}

# Keep in sync with enabledPlugins in .claude/settings.json.
# expo/skills needs --sparse: its eval-harness git submodule points at a repo
# the cloud proxy can't authenticate to, so a full clone fails.
ensure "toycrane-skills@toycrane" "toycrane" "toy-crane/skills"
ensure "expo@expo-plugins" "expo-plugins" "expo/skills" --sparse .claude-plugin plugins
ensure "supabase@supabase-agent-skills" "supabase-agent-skills" "supabase/agent-skills"
ensure "postgres-best-practices@supabase-agent-skills" "supabase-agent-skills" "supabase/agent-skills"

exit 0
