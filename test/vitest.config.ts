import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 8000,
    setupFiles: ["dotenv-override-true/config"],
  },
});
