import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
const gatewayTarget = process.env.VITE_GATEWAY_TARGET || 'http://localhost:8090'

export default defineConfig({
  // GitHub Pages 部署配置
  // base: '/Prototype_Design_test/',
  base: '/',

  plugins: [vue()],
  resolve: {
    alias: {
      //'@': path.resolve(__dirname, 'src')
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: gatewayTarget,
        changeOrigin: true
      }
    }
  }
})

