// import path from "node:path"
// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import tailwindcss from "@tailwindcss/vite"

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: { "@": path.resolve(__dirname, "./src") },
//   },
//   server: {
//   host: "0.0.0.0",
//   port: 5173,
//   strictPort: true,
//   proxy: {
//     "/api": {
//       target: "http://127.0.0.1:5001",
//       changeOrigin: true,
//     },
//   },
// },
// })


import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".devtunnels.ms"], // Vite blocks unknown Host headers by default
    proxy: {
      "/api": { target: "http://127.0.0.1:5001", changeOrigin: true },
    },
  },
})