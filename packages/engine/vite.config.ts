import { resolve } from "node:path";
import ts from "typescript";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    dts({
      beforeWriteFile(filePath, content) {
        return {
          content: stripHiddenHeritageTypes(filePath, content),
        };
      },
    }),
  ],
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
  },
});

// for performance reasons, the engine sometimes relies on inheritance rather than composition.
// in these cases, remove certain base class declarations to unclutter autocomplete and protect
// users from accidentally using internal apis.
function stripHiddenHeritageTypes(filePath: string, content: string): string {
  if (!filePath.endsWith(".d.ts")) {
    return content;
  }

  const hiddenHeritageTypes = ["Float32Array"];

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  let changed = false;

  const hasHiddenBase = (clause: ts.HeritageClause): boolean =>
    clause.token === ts.SyntaxKind.ExtendsKeyword &&
    clause.types.some(
      (type) =>
        ts.isIdentifier(type.expression) && hiddenHeritageTypes.includes(type.expression.text),
    );

  const result = ts.transform(sourceFile, [
    (context) => {
      const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isClassDeclaration(node) && node.heritageClauses?.some(hasHiddenBase)) {
          changed = true;
          const heritageClauses = node.heritageClauses.filter((clause) => !hasHiddenBase(clause));

          return context.factory.updateClassDeclaration(
            node,
            node.modifiers,
            node.name,
            node.typeParameters,
            heritageClauses.length > 0 ? heritageClauses : undefined,
            node.members,
          );
        }

        return ts.visitEachChild(node, visit, context);
      };

      return (node) => ts.visitNode(node, visit) as ts.SourceFile;
    },
  ]);

  const transformed = result.transformed[0];
  result.dispose();

  return changed && transformed ? ts.createPrinter().printFile(transformed) : content;
}
