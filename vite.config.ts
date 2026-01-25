import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';
import babel from '@rollup/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: (format) => `msb-file.${format}.js`,
    },
    outDir: 'lib',
    copyPublicDir: false,
    rollupOptions: {
      external: ['localforage', 'streamsaver', 'js-md5'],
      plugins: [babel({
        extensions: ['.js' ,'.ts']
      })]
    }
  },
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
});
