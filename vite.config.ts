import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

export default defineConfig({
  plugins: [
    webExtension({
      manifest: generateManifest,
      browser: process.env.TARGET || "chrome",
      watchFilePaths: ["package.json", "manifest.json", "background.ts"],
      webExtConfig: {
        target: (process.env.TARGET === "firefox") ? "firefox-desktop" : "chromium",
      }
    }),
  ],
});
