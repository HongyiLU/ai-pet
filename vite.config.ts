import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 生产环境使用根路径（Vercel），GitHub Pages需要 /ai-pet/
  base: process.env.GITHUB_PAGES === 'true' ? '/ai-pet/' : '/',
  server: {
    port: 5173,
    host: true
  }
})
