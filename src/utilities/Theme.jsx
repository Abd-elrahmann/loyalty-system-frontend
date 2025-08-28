  import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800080',       // purple
      light: '#a64ca6',    // purple light
      dark: '#4b004b',     // purple dark
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f0f0f0',     // gray
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#2a2a2a'
    },
    error: {
      main: '#D91656',     // red
      light: '#e44479',
      dark: '#970f3c',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8f8f8',
      main: '#800080',
      paper: '#ffffff'     
    },
    text: {
      main: '#ffffff',
      primary: '#2a2a2a',
      secondary: '#800080',
      black: '#2a2a2a'
    }
  },

  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#2a2a2a'
    },
    h2: {
      fontWeight: 500,
      color: '#2a2a2a'
    },
    h3: {
      fontWeight: 500,
      color: '#2a2a2a'
    },
    body1: {
      color: '#2a2a2a'
    }
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px'
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#a64ca6'
          }
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#eeeeee'
          }
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
        }
      }
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff'
          }
        }
      }
    }
  }
});

export default theme;