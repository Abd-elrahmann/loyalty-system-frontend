import { ThemeProvider } from '@mui/material/styles';
import theme from './utilities/Theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Register from './Auth/Register';
import Login from './Auth/Login';
import { useTranslation } from 'react-i18next';
import './App.css';
import { useEffect, useMemo } from 'react';
import ForgetPassword from './Auth/ForgetPassword';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import ResetPassword from './Auth/ResetPassword';
const Customers = React.lazy(() => import('./Pages/Customers'));
const Profile = React.lazy(() => import('./Components/Shared/Profile'));
const Home = React.lazy(() => import('./Components/Shared/Home'));
const Dashboard = React.lazy(() => import('./Pages/Dashboard'));
const MainLayout = React.lazy(() => import('./Components/Shared/MainLayout'));
const Products = React.lazy(() => import('./Pages/Products'));
const Transactions = React.lazy(() => import('./Pages/Transactions'));

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};


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
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Home />
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
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <MainLayout>
                  <Customers />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <MainLayout>
                  <Transactions />
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </CacheProvider>
    </ThemeProvider>
  );
}

export default App
