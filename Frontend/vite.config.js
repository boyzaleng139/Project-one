import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward REST API calls to the Backend
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
      // Forward Socket.io (HTTP + WebSocket upgrade) to the Backend
      '/socket.io': {
        target:       'http://localhost:3001',
        changeOrigin: true,
        ws:           true,
      },
    },
  },
})
