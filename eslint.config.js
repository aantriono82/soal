import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "apps/web/dist/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: false
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        Bun: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
);
