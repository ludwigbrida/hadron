import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  resolve: {
    tsconfigPaths: command === "serve",
  },
}));
