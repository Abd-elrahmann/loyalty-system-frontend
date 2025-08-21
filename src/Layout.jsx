
import { ThemeProvider } from '@mui/material/styles';
import theme from './utilities/Theme';
 
export default function MainLayout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
