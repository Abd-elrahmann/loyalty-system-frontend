import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Map of routes and their related routes that should be prefetched
const routePrefetchMap = {
  '/dashboard': ['/transactions', '/products'],
  '/customers': ['/transactions'],
  '/transactions': ['/customers', '/products'],
  '/products': ['/point-of-sale', '/invoice'],
  '/point-of-sale': ['/invoice', '/products'],
  '/invoice': ['/point-of-sale', '/transactions'],
  '/rewards': ['/transactions', '/customers'],
  '/reports': ['/transactions', '/products', '/invoice']
};

export const useRoutePrefetch = () => {
  const location = useLocation();

  useEffect(() => {
    const routesToPrefetch = routePrefetchMap[location.pathname];
    
    if (routesToPrefetch) {
      // Prefetch related routes after a short delay to not block the main route
      const timer = setTimeout(() => {
        routesToPrefetch.forEach(route => {
          const componentPath = route.replace('/', '');
          // Capitalize first letter and remove hyphens
          const formattedPath = componentPath
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
          
          import(`../Pages/${formattedPath}`).catch(() => {
            // Silently fail if component doesn't exist
          });
        });
      }, 1000); // Wait 1 second after route change

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
};
