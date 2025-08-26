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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar 
        onMenuClick={handleSidebarToggle} 
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        sx={{
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      />
      
      {shouldShowSidebar && (
        <Sidebar 
          key={i18n.language}
          open={isMobile ? sidebarOpen : sidebarVisible} 
          onToggle={isMobile ? handleSidebarToggle : () => setSidebarVisible(!sidebarVisible)}
          sidebarVisible={sidebarVisible}
          isRTL={isRTL}
        />
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          width: '100%',
          marginTop: '64px', 
          marginLeft: shouldShowSidebar && !isMobile && sidebarVisible ? '230px' : 0,
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isRTL && {
            marginRight: shouldShowSidebar && !isMobile && sidebarVisible ? '0' : 0,
            marginLeft: 0,
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;