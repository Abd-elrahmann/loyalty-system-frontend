import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pages = import.meta.glob('../Pages/*.jsx');

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
      const timer = setTimeout(() => {
        routesToPrefetch.forEach(route => {
          const componentPath = route.replace('/', '');
          const formattedPath = componentPath
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

          const filePath = `../Pages/${formattedPath}.jsx`;
          
          if (pages[filePath]) {
            pages[filePath]();
          }
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
};
