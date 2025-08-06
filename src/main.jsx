import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './Config/translationConfig.js'
import './utilities/Theme.jsx'
import {ThemeProvider} from '@mui/material/styles'
import theme from './utilities/Theme.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
)
