import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// En GitHub Pages la web vive en /PrivacyProbe/; en local, en la raíz.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/PrivacyProbe/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // React y Recharts aparte: la página principal carga antes y jsPDF solo al exportar
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|es-toolkit|immer|reselect|@reduxjs|react-redux|redux)[\\/]/ },
          ],
        },
      },
    },
  },
});
