import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const root = import.meta.dir;

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sources(path);
    }
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")
      ? [path]
      : [];
  });
}

test("운영 API의 실행 시 상대 import는 Node가 찾을 수 있는 .js 경로를 쓴다", () => {
  const invalid: string[] = [];
  for (const path of sources(root)) {
    const source = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement)) {
        continue;
      }
      const clause = statement.importClause;
      if (
        clause?.isTypeOnly ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        continue;
      }
      const bindings = clause?.namedBindings;
      if (
        bindings &&
        ts.isNamedImports(bindings) &&
        !clause.name &&
        bindings.elements.every((element) => element.isTypeOnly)
      ) {
        continue;
      }
      const specifier = statement.moduleSpecifier.text;
      if (specifier.startsWith(".") && !specifier.endsWith(".js")) {
        invalid.push(`${relative(root, path)}: ${specifier}`);
      }
    }
  }
  expect(invalid).toEqual([]);
});
