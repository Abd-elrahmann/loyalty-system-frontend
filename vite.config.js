import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
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
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Material UI
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'mui-vendor';
          }
          // Antd
          if (id.includes('node_modules/antd')) {
            return 'antd-vendor';
          }
          // Charts
          if (id.includes('node_modules/chart.js') || 
              id.includes('node_modules/recharts') || 
              id.includes('node_modules/react-chartjs-2') ||
              id.includes('node_modules/@coreui/react-chartjs')) {
            return 'charts-vendor';
          }
          // Date libraries
          if (id.includes('node_modules/dayjs') || 
              id.includes('node_modules/date-fns') || 
              id.includes('node_modules/moment-timezone')) {
            return 'date-vendor';
          }
          // PDF and file handling
          if (id.includes('node_modules/jspdf') || 
              id.includes('node_modules/xlsx') || 
              id.includes('node_modules/file-saver')) {
            return 'file-vendor';
          }
          // Router and query
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/@tanstack/react-query')) {
            return 'router-query-vendor';
          }
          // Icons
          if (id.includes('node_modules/@mui/icons-material') || 
              id.includes('node_modules/react-icons') || 
              id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          // Other utilities
          if (id.includes('node_modules/lodash') || 
              id.includes('node_modules/axios') || 
              id.includes('node_modules/formik')) {
            return 'utils-vendor';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Lower warning limit to catch issues early
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    }
  }
})
