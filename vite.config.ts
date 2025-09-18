import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"
import { fileURLToPath } from "url"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(fileURLToPath(new URL("./src", import.meta.url))),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5069', // backend portun
    },
  },
})
