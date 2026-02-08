import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

import dns from "node:dns";
dns.setDefaultResultOrder("verbatim");


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    host: "localhost",
    proxy:{
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
})