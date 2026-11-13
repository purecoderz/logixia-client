import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "coep-except-video-player",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? "";
          if (!url.startsWith("/sessions/")) {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|react-router-dom|react-router)[\\/]/,
            },
            {
              name: "codemirror",
              test: /node_modules[\\/](@codemirror|@uiw\/react-codemirror|@uiw\/codemirror-theme-|@lezer)/,
            },
            {
              name: "markdown",
              test: /node_modules[\\/](react-markdown|react-syntax-highlighter|remark-|rehype-|micromark|mdast-|unified|hast-|refractor|prismjs)/,
            },
            {
              name: "ui-vendor",
              test: /node_modules[\\/](lucide-react|@headlessui\/react|@tanstack\/react-query|react-resizable-panels|jszip)/,
            },
          ],
        },
      },
    },
  },
});
