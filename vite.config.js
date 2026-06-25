import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built site works when opened directly
  // from the filesystem (file://) without a web server.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
