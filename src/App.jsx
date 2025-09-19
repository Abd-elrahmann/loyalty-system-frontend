import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useMemo, useEffect } from 'react';
import { Spin } from 'antd';
import Register from './Auth/Register';
import Login from './Auth/Login';
import Profile from './Components/Shared/Profile';
import { useTranslation } from 'react-i18next';
import './App.css';
import ForgetPassword from './Auth/ForgetPassword';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import ResetPassword from './Auth/ResetPassword';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import MainRoutes from './Config/routes';
import { getFirstAccessibleRoute } from './utilities/permissions.js';

const Layout = React.lazy(() => import('./Layout'));
const MainLayout = React.lazy(() => import('./Components/Shared/MainLayout'));

const routeComponents = {
  '/dashboard': React.lazy(() => {
    const component = import('./Pages/Dashboard');
    import('./Pages/Transactions'); 
    import('./Pages/Products');
    return component;
  }),
  '/mangers': React.lazy(() => import('./Pages/Mangers')),
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
    return createCache({
      key: i18n.dir() === 'rtl' ? 'muirtl' : 'muiltr',
      stylisPlugins: i18n.dir() === 'rtl' ? [prefixer, rtlPlugin] : []
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.dir()]);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<CenteredSpinner />}>
        <Layout>
          <CacheProvider value={cacheRtl}>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to={localStorage.getItem('token') ? getDefaultRoute() : '/login'} replace />}
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgetPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />
                {MainRoutes.map((route, index) => {
                  const RouteComponent = routeComponents[route.path];
                  return (
                    <Route
                      key={index}
                      path={route.path}
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            <Suspense fallback={<CenteredSpinner />}>
                              <RouteComponent />
                            </Suspense>
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                  );
                })}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions/:customerId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<CenteredSpinner />}>
                          {React.createElement(routeComponents['/transactions'])}
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <ToastContainer />
            </BrowserRouter>
          </CacheProvider>
        </Layout>
      </Suspense>
    </QueryClientProvider>
  );
}

const CenteredSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spin size="large" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const getDefaultRoute = () => {
  try {
    const profile = localStorage.getItem('profile');
    if (profile) {
      const user = JSON.parse(profile);
      return getFirstAccessibleRoute(user);
    }
  } catch (error) {
    console.warn('Error parsing user profile:', error);
  }
  return '/dashboard';
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : children;
};

export default App;
