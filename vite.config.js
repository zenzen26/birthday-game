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
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          rapier: ['@react-three/rapier'],
          fiber: ['@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  }
})