import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { getFirstAccessibleRoute, hasRouteAccess } from './utilities/permissions.js';
import OfflineAlert from './hooks/OfflineAlert.jsx';

const Layout = React.lazy(() => import('./Layout'));
const MainLayout = React.lazy(() => import('./Components/Shared/MainLayout'));

// أنشئ كومبوننت محمية لكل route
const createProtectedComponent = (importFunc, routePath) => {
  return function ProtectedComponentWrapper() {
    
  
    const isAuthorized = React.useMemo(() => {
      try {
        const profile = localStorage.getItem('profile');
        if (profile) {
          const user = JSON.parse(profile);
          if (user.role === 'ADMIN') return true;
          return hasRouteAccess(user, routePath);
        }
      } catch (error) {
        console.warn('Error checking permissions:', error);
      }
      return false;
    }, []);

    if (!isAuthorized) {
      return <Navigate to={getDefaultRoute()} replace />;
    }

    const LazyComponent = React.lazy(importFunc);
    return (
      <Suspense fallback={<CenteredSpinner />}>
        <LazyComponent />
      </Suspense>
    );
  };
};

const routeComponents = {
  '/dashboard': createProtectedComponent(() => import('./Pages/Dashboard'), '/dashboard'),
  '/managers': createProtectedComponent(() => import('./Pages/Managers'), '/managers'),
  '/customers': createProtectedComponent(() => import('./Pages/Customers'), '/customers'),
  '/transactions': createProtectedComponent(() => import('./Pages/Transactions'), '/transactions'),
  '/products': createProtectedComponent(() => import('./Pages/Products'), '/products'),
  '/settings': createProtectedComponent(() => import('./Pages/Settings'), '/settings'),
  '/rewards': createProtectedComponent(() => import('./Pages/Rewards'), '/rewards'),
  '/point-of-sale': createProtectedComponent(() => import('./Pages/PointOfSale'), '/point-of-sale'),
  '/invoice': createProtectedComponent(() => import('./Pages/Invoice'), '/invoice'),
  '/reports': createProtectedComponent(() => import('./Pages/Reports/Reports'), '/reports'),
  '/logs': createProtectedComponent(() => import('./Pages/Logs/Logs'), '/logs')
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
        <Layout>
          <CacheProvider value={cacheRtl}>
            <BrowserRouter>
              <OfflineAlert />
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
                            {RouteComponent && <RouteComponent />}
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
                        {routeComponents['/transactions'] && React.createElement(routeComponents['/transactions'])}
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <ToastContainer />
            </BrowserRouter>
          </CacheProvider>
        </Layout>
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
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  try {
    const profile = localStorage.getItem('profile');
    if (profile) {
      const user = JSON.parse(profile);
      const currentPath = location.pathname;
      
      // إذا كان المستخدم ADMIN، يسمح له بالوصول إلى كل الصفحات
      if (user.role === 'ADMIN') {
        return children;
      }
      
      // التحقق من صلاحيات المستخدم للصفحة الحالية
      if (hasRouteAccess(user, currentPath)) {
        return children;
      } else {
        // إذا لم يكن لديه صلاحية، إرجاعه إلى الصفحة الأولى المسموح له بها
        return <Navigate to={getFirstAccessibleRoute(user)} replace />;
      }
    }
  } catch (error) {
    console.warn('Error checking route permissions:', error);
  }
  
  return <Navigate to="/login" replace />;
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