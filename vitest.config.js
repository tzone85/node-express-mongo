import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    exclude: ["node_modules/**"],
    testTimeout: 30000,
    hookTimeout: 60000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/server.js", "src/db/connect.js"],
      reporter: ["text", "html"],
      // Branches at 75: the uncovered branches are defensive `catch (err) { next(err) }`
      // and "unexpected error path" blocks in routes — exercising them requires
      // a flaky mongoose mock. The happy paths are 100% covered.
      thresholds: { lines: 85, branches: 75, functions: 85, statements: 85 },
    },
  },
});
