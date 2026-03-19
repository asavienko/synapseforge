import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import cypressPlugin from "eslint-plugin-cypress";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Disable React Compiler rules that are too strict for current codebase
      "react-compiler/react-compiler": "off",
      // Disable set-state-in-effect rule - causes too many false positives with common patterns
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Cypress plugin for e2e tests
  {
    files: ["cypress/**/*.ts", "cypress/**/*.js"],
    plugins: {
      cypress: cypressPlugin,
    },
    rules: {
      ...cypressPlugin.configs.recommended.rules,
      // Allow namespaces in Cypress type definitions (standard pattern)
      "@typescript-eslint/no-namespace": "off",
    },
  },
  // Disable explicit-any rule for scripts (one-off migrations)
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
