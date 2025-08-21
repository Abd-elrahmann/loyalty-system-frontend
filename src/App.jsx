import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Register from './Auth/Register';
import Login from './Auth/Login';
import Profile from './Components/Shared/Profile';
import { useTranslation } from 'react-i18next';
import './App.css';
import { useEffect, useMemo } from 'react';
import ForgetPassword from './Auth/ForgetPassword';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import ResetPassword from './Auth/ResetPassword';
import Dashboard from './Pages/Dashboard';

const ToastContainer = React.lazy(() =>
  import('react-toastify').then(m => ({ default: m.ToastContainer }))
); 
const MainLayout = React.lazy(() => import('./Components/Shared/MainLayout'));

const Customers = React.lazy(() => import('./Pages/Customers'));
const Transactions = React.lazy(() => import('./Pages/Transactions'));
const Products = React.lazy(() => import('./Pages/Products'));
const Settings = React.lazy(() => import('./Pages/Settings'));
const Rewards = React.lazy(() => import('./Pages/Rewards'));
const Layout = React.lazy(() => import('./Layout'));
import MainRoutes from './Config/routes';

const routeComponents = {
  '/dashboard': Dashboard,
  '/customers': Customers,
  '/transactions': Transactions,
  '/products': Products,
  '/settings': Settings,
  '/rewards': Rewards,
};
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');

  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
        <Layout >
      <CacheProvider value={cacheRtl}>
      <BrowserRouter> 
          <Routes>
            <Route path="/" element={
              <Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} replace />
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
            {MainRoutes.map((route, index) => {
              const RouteComponent = routeComponents[route.path];
              return (
                <Route key={index} path={route.path} element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RouteComponent />
                    </MainLayout>
                  </ProtectedRoute>
                } />
              );
            })}
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/transactions/:customerId" element={
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
      </Layout>
  );
}

export default App
