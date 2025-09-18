import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
  },
  optimizeDeps: {
    include: [
      '@ant-design/icons', // عشان يمنع مشاكل CJS مع Vite
    ],
  },
  build: {
    minify: 'terser',
    commonjsOptions: {
      transformMixedEsModules: true, // مهم عشان يدعم CJS + ESM مع بعض
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'], // خلي الـ regex explicit
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'utils-vendor': ['axios', 'lodash'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
