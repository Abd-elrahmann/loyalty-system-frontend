import { ThemeProvider } from '@mui/material/styles';
import theme from './utilities/Theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import Spinner from './utilities/Spinner';
import Register from './Auth/Register';
import Login from './Auth/Login';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import ForgetPassword from './Auth/ForgetPassword';
import DefaultLayout from './Components/DefaultLayout';
import { createCache, prefixer } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.dir();
  }, [i18n.dir()]);

  const cacheRtl = useMemo(() => {
    if (i18n.dir() === 'rtl') {
      return createCache({
        key: 'muirtl',
        stylisPlugins: [prefixer, rtlPlugin],
      });
    } else {
      return createCache({
        key: "muiltr"
      });
    }
  }, [i18n.dir()]);

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheRtl}>
      <BrowserRouter> 
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<DefaultLayout />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
          </Routes>
        </Suspense>
          <ToastContainer />
        </BrowserRouter>
      </CacheProvider>
    </ThemeProvider>
  );
}

export default App
