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
      '@ant-design/icons',
    ],
  },
  build: {
    minify: 'terser',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'mui-core': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          'ant-icons': ['@ant-design/icons'],
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
