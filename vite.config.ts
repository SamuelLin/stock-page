import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: "/src"
      }
    ]
  },
  server: {
    proxy: {
      '/api/twse': {
        target: 'https://openapi.twse.com.tw/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twse/, ''),
        secure: true,
        followRedirects: true
      },
      '/api/tpex': {
        target: 'https://www.tpex.org.tw/openapi/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tpex/, ''),
        secure: true,
        followRedirects: true
      }
    }
  }
})
