import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import cypressPlugin from "eslint-plugin-cypress";

// Disable all eslint-plugin-react rules due to ESLint 10 compatibility issues
const disableAllReactRules = Object.fromEntries(
  [
    "display-name", "no-direct-mutation-state", "prop-types", "react-in-jsx-scope",
    "no-unknown-property", "no-string-refs", "no-find-dom-node", "no-is-mounted",
    "no-deprecated", "require-render-return", "no-unused-state", "no-access-state-in-setstate",
    "no-redundant-should-component-update", "no-this-in-sfc", "no-typos", "style-prop-object",
    "void-dom-elements-no-children", "no-unescaped-entities", "no-danger-with-children",
    "no-will-update-set-state", "no-did-update-set-state", "no-did-mount-set-state",
    "no-render-return-value", "jsx-no-duplicate-props", "jsx-no-undef", "jsx-uses-react",
    "jsx-uses-vars", "no-children-prop", "no-danger", "jsx-key", "jsx-no-target-blank",
    "function-component-definition", "jsx-props-no-spreading", "-hooks/rules-of-hooks",
    "-hooks/exhaustive-deps", "jsx-no-leaked-render", "jsx-no-useless-fragment",
  ].map(rule => [`react/${rule}`, "off"])
);

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
    // Node CLI scripts — use CommonJS require(), not subject to Next.js ESLint rules
    "scripts/**",
  ]),
  {
    rules: {
      // Disable React Compiler rules that are too strict for current codebase
      "react-compiler/react-compiler": "off",
      // Disable set-state-in-effect rule - causes too many false positives with common patterns
      "react-hooks/set-state-in-effect": "off",
      // Disable all eslint-plugin-react rules due to ESLint 10 compatibility issues
      ...disableAllReactRules,
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
