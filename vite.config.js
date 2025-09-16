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
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
          'antd-vendor': ['antd'],
          'charts-vendor': ['chart.js', 'recharts', 'react-chartjs-2', '@coreui/react-chartjs'],
          'dayjs-vendor': ['dayjs'],
          'date-fns-vendor': ['date-fns'],
          'moment-vendor': ['moment-timezone'],
          'file-vendor': ['jspdf', 'xlsx', 'file-saver'],
          'router-query-vendor': ['react-router-dom', '@tanstack/react-query'],
          'icons-vendor': ['@mui/icons-material', 'react-icons', 'lucide-react'],
          'utils-vendor': ['lodash', 'axios', 'formik'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'animation-vendor': ['framer-motion'],
          'qr-vendor': ['qr-scanner', 'react-qr-reader'],
          'notification-vendor': ['react-toastify', 'sweetalert2']
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
