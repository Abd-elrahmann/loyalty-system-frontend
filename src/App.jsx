import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useMemo } from 'react';
import Register from './Auth/Register';
import Login from './Auth/Login';
import Profile from './Components/Shared/Profile';
import { useTranslation } from 'react-i18next';
import './App.css';
import { useEffect } from 'react';
import ForgetPassword from './Auth/ForgetPassword';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import ResetPassword from './Auth/ResetPassword';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import MainRoutes from './Config/routes';

const Layout = React.lazy(() => import('./Layout'));
const MainLayout = React.lazy(() => import('./Components/Shared/MainLayout'));

const Dashboard = React.lazy(() => import('./Pages/Dashboard'));
const routeComponents = {
  '/dashboard': React.lazy(() => {
    const component = import('./Pages/Dashboard');
    import('./Pages/Transactions');
    import('./Pages/Products');
    return component;
  }),
  '/permissions': React.lazy(() => import('./Pages/Permissions')),
  '/customers': React.lazy(() => import('./Pages/Customers')),
  '/transactions': React.lazy(() => import('./Pages/Transactions')),
  '/products': React.lazy(() => import('./Pages/Products')),
  '/settings': React.lazy(() => import('./Pages/Settings')),
  '/rewards': React.lazy(() => import('./Pages/Rewards')),
  '/point-of-sale': React.lazy(() => import('./Pages/PointOfSale')),
  '/invoice': React.lazy(() => import('./Pages/Invoice')),
  '/reports': React.lazy(() => import('./Pages/Reports'))
};

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
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
                  {React.createElement(routeComponents['/transactions'])}
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </CacheProvider>
      </Layout>
    </QueryClientProvider>
  );
}

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

export default App