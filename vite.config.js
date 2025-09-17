import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
  },
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@mui')) return 'mui-vendor';
            if (id.includes('antd')) return 'antd-vendor';
            if (id.includes('chart')) return 'charts-vendor';
            if (id.includes('axios') || id.includes('lodash')) return 'utils-vendor';
          }
        }
      }
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
