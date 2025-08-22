import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { I18nextProvider } from 'react-i18next'
import './utilities/Theme.jsx'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import theme from './utilities/Theme.jsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {HelmetProvider} from 'react-helmet-async'
import i18n from './Config/translationConfig.js'
dayjs.extend(utc)

createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <HelmetProvider>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </HelmetProvider>
      </LocalizationProvider>
    </ThemeProvider>
)
