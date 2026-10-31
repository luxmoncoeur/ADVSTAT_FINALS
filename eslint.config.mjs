import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  {
    // Vendored code from the React Bits and shadcn registries is kept as published
    // so it can be updated with the CLI. These animation components intentionally
    // mirror props into refs during render; React Compiler skips them automatically.
    files: ["src/components/reactbits/**", "src/components/ui/**", "src/hooks/use-mobile.js"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
