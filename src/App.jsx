import { ThemeProvider } from '@mui/material/styles';
import theme from './utilities/Theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import Spinner from './utilities/Spinner';
import Register from './Auth/Register';
import Login from './Auth/Login';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import ForgetPassword from './Auth/ForgetPassword';
import DefaultLayout from './Components/DefaultLayout';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import Dashboard from './Pages/Dashboard';
import ResetPassword from './Auth/ResetPassword';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.dir();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.dir()]);

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheRtl}>
      <BrowserRouter> 
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <DefaultLayout />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgetPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
          <ToastContainer />
        </BrowserRouter>
      </CacheProvider>
    </ThemeProvider>
  );
}

export default App
