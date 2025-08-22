import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import './Config/translationConfig.js'
import './utilities/Theme.jsx'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import theme from './utilities/Theme.jsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {HelmetProvider} from 'react-helmet-async'

dayjs.extend(utc)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </LocalizationProvider>
    </ThemeProvider>
)
