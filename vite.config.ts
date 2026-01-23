import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  build: {
    lib: {
      entry: ['src/index.ts'],
      formats: ['es'],
      fileName: (format, entryName) => `download-lib-${entryName}.${format}.js`,
    },
    outDir: "lib"
  }
})
