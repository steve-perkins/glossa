import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Load .env from the monorepo root, not apps/web/
  envDir: path.resolve(__dirname, '../../'),
  plugins: [react()],
  server: {},
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
})
