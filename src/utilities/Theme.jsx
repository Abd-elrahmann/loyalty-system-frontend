import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800080',     // موف رئيسي
      light: '#a64ca6',    // موف للهوفر أو تأثيرات فاتحة
      dark: '#4b004b',     // موف داكن (للـ:active مثلاً)
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f0f0f0',     // رمادي فاتح كدعم للثيم
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#2a2a2a'
    },
    error: {
      main: '#D91656',     // نفس اللون القديم للخطاء
      light: '#e44479',
      dark: '#970f3c',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f0f0f0', 
      main: '#800080',
      paper: '#ffffff'     
    },
    text: {
      main: '#ffffff',
      primary: '#2a2a2a',  // لون النص الرئيسي
      secondary: '#800080' // موف لنصوص فرعية أو عناوين
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
