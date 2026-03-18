import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/birthday-game/',
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.bin'],
  optimizeDeps: {
    exclude: ['@react-three/rapier']
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@react-three/rapier')) return 'rapier'
          if (id.includes('node_modules/@react-three')) return 'fiber'
        }
      }
    }
  }
})