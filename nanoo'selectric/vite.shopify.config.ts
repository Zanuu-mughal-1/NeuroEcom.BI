import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'shopify-theme/assets',
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: 'react-app.js',
          assetFileNames: 'react-app.[ext]',
          inlineDynamicImports: true
        }
      }
    }
  };
});
