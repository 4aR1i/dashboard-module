import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { resolve } from "path";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "./src",
      outDir: "./dist",
      tsconfigPath: "./tsconfig.json",
    }),
    cssInjectedByJsPlugin(),
    svgLoader(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "DashboardModule",
      fileName: (format) => `dashboard-module.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
