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
          
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'mui-vendor';
          }
          
          if (id.includes('node_modules/antd')) {
            return 'antd-vendor';
          }
          
          if (id.includes('node_modules/chart.js') || 
              id.includes('node_modules/recharts') || 
              id.includes('node_modules/react-chartjs-2') ||
              id.includes('node_modules/@coreui/react-chartjs')) {
            return 'charts-vendor';
          }
          if (id.includes('node_modules/dayjs') || 
              id.includes('node_modules/date-fns') || 
              id.includes('node_modules/moment-timezone')) {
            return 'date-vendor';
          }
          if (id.includes('node_modules/jspdf') || 
              id.includes('node_modules/xlsx') || 
              id.includes('node_modules/file-saver')) {
            return 'file-vendor';
          }
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/@tanstack/react-query')) {
            return 'router-query-vendor';
          }
          if (id.includes('node_modules/@mui/icons-material') || 
              id.includes('node_modules/react-icons') || 
              id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          if (id.includes('node_modules/lodash') || 
              id.includes('node_modules/axios') || 
              id.includes('node_modules/formik')) {
            return 'utils-vendor';
          }
          if (id.includes('node_modules/i18next') || 
              id.includes('node_modules/react-i18next')) {
            return 'i18n-vendor';
          }
          
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          if (id.includes('node_modules/qr-scanner') || 
              id.includes('node_modules/react-qr-reader')) {
            return 'qr-vendor';
          }
          if (id.includes('node_modules/react-toastify') || 
              id.includes('node_modules/sweetalert2')) {
            return 'notification-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
