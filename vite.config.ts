import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { resolve as pathResolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 9080
  },

  resolve: {
    alias: {
      '@': pathResolve(__dirname, './src')
    },
  },
})
