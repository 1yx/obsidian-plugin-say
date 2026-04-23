// ESLint Flat Config (ESM) — adapted for Obsidian plugin (browser runtime)

import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import tsdocPlugin from "eslint-plugin-tsdoc";
import jsdocPlugin from "eslint-plugin-jsdoc";
import checkFile from "eslint-plugin-check-file";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";

/** @type {import('eslint').Rule.RuleModule} */
const globalLiteralConstNaming = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce UPPER_SNAKE_CASE for global const with literal values",
    },
    messages: {
      upperSnake:
        "Global const with a literal value should use UPPER_SNAKE_CASE. Rename `{{name}}` to `{{suggested}}`.",
    },
    schema: [],
  },
  /** @param {import('eslint').Rule.RuleContext} context */
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind !== "const") return;
        if (node.parent.type !== "Program") return;

        for (const decl of node.declarations) {
          if (decl.id.type !== "Identifier") continue;
          if (!decl.init) continue;

          const init = decl.init;
          const isLiteral =
            init.type === "Literal" ||
            (init.type === "TemplateLiteral" &&
              init.expressions.length === 0) ||
            (init.type === "UnaryExpression" &&
              init.argument.type === "Literal");

          if (!isLiteral) continue;

          const name = decl.id.name;
          if (/^[A-Z][A-Z0-9_]*$/.test(name)) continue;

          context.report({
            node: decl.id,
            messageId: "upperSnake",
            data: {
              name,
              suggested: name
                .replace(/([a-z])([A-Z])/g, "$1_$2")
                .toUpperCase(),
            },
          });
        }
      },
    };
  },
};

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "eslint.config.mjs",
      "esbuild.config.mjs",
      "version-bump.mjs",
      "versions.json",
      "main.js",
    ],
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: prettierPlugin,
      tsdoc: tsdocPlugin,
      jsdoc: jsdocPlugin,
      "check-file": checkFile,
      custom: {
        rules: {
          "global-literal-const-naming": globalLiteralConstNaming,
        },
      },
    },

    rules: {
      // ========== Naming Conventions ==========

      "custom/global-literal-const-naming": "error",

      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "typeLike", format: ["PascalCase"] },
        {
          selector: "variable",
          format: ["PascalCase", "camelCase"],
          filter: { regex: "Schema$", match: true },
        },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          format: ["UPPER_CASE", "camelCase"],
        },
        {
          selector: ["variable", "function", "parameter"],
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "property",
          format: null,
        },
      ],

      "check-file/filename-naming-convention": [
        "error",
        {
          "src/**/*.{js,mjs,cjs,ts,mts,cts}": "KEBAB_CASE",
          "test/**/*.{js,mjs,cjs,ts,mts,cts}": "KEBAB_CASE",
          "tests/**/*.{js,mjs,cjs,ts,mts,cts}": "KEBAB_CASE",
          "scripts/**/*.{js,mjs,cjs,ts,mts,cts}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],

      // ========== Code Quality Limits ==========

      "max-lines-per-function": [
        "error",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "max-depth": ["error", 4],
      "max-params": ["error", 3],
      complexity: ["error", 10],

      // ========== Core Code Style ==========

      "no-unused-vars": "off",
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "object-shorthand": "error",
      "prefer-template": "error",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
      "no-unsafe-optional-chaining": "error",
      "no-console": "off",
      "no-debugger": "warn",
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],

      // ========== TypeScript ==========

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      "@typescript-eslint/no-require-imports": "error",

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/no-unsafe-assignment": "warn",

      "@typescript-eslint/no-unsafe-return": "warn",

      // ========== Async / Promise Safety ==========

      "@typescript-eslint/no-floating-promises": "error",

      "@typescript-eslint/no-misused-promises": "error",

      "@typescript-eslint/await-thenable": "error",

      "@typescript-eslint/require-await": "warn",

      // ========== TSDoc ==========

      "tsdoc/syntax": "warn",
    },
  },
  {
    // Relax quality limits in scripts
    files: [
      "scripts/**/*.{js,mjs,cjs,ts,mts,cts}",
      "src/scripts/**/*.{js,mjs,cjs,ts,mts,cts}",
    ],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
      complexity: "off",
      "max-params": "off",
      "max-depth": "off",
      "jsdoc/require-jsdoc": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ...eslintConfigPrettier,
  },
);
