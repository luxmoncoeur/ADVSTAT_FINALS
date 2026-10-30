import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/stats/**/*.js"],
      exclude: ["src/lib/stats/**/__tests__/**"],
      thresholds: { lines: 100, functions: 100, statements: 100, branches: 95 },
    },
  },
});
