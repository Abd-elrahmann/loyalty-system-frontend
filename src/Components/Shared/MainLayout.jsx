import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isAuthenticated = localStorage.getItem('token');
  const shouldShowSidebar = isAuthenticated && ![
    '/', 
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/reset-password'
  ].includes(window.location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        onMenuClick={handleSidebarToggle} 
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
      />
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', mt: -5 }}>
        {shouldShowSidebar && (
          <Sidebar 
            key={i18n.language} // إعادة بناء عند تغيير اللغة
            open={sidebarOpen} 
            onToggle={handleSidebarToggle}
            sidebarVisible={sidebarVisible}
            isRTL={isRTL} // تمرير الاتجاه لو حبيت تستخدمه جوه السايد بار
          />
        )}
        
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            backgroundColor: 'background.default',
            width: shouldShowSidebar && !isMobile && sidebarVisible ? 'calc(100% - 200px)' : '100%',
            mt: 4
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
