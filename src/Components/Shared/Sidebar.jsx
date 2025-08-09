import React, { useLayoutEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon, 
  Inventory as ProductsIcon,
  CardGiftcard as RewardsIcon,
  Settings as SettingsIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const drawerWidth = 280;

const Sidebar = ({  onToggle, sidebarVisible }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isRTL = i18n.language === 'ar';

  useLayoutEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);
  

  const navigationItems = [
    {
      name: 'Dashboard',
      arName: 'لوحة التحكم',
      path: '/dashboard',
      icon: <DashboardIcon />
    },
    {
      name: 'Customers',
      arName: 'العملاء', 
      path: '/customers',
      icon: <PeopleIcon />
    },
    {
      name: 'Products',
      arName: 'المنتجات',
      path: '/products', 
      icon: <ProductsIcon />
    },
    {
      name: 'Rewards',
      arName: 'المكافآت',
      path: '/rewards',
      icon: <RewardsIcon />
    },
    {
      name: 'Settings',
      arName: 'الإعدادات',
      path: '/settings',
      icon: <SettingsIcon />
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', mt: 5 }}>
      <List sx={{ flex: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                mb: 1,
                mt: 1,
                borderRadius: 2,
                cursor: 'pointer',
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.main' : 'primary.light',
                  '& .MuiListItemText-primary': {
                    color: 'white'
                  }
                },
                '& .MuiListItemText-primary': {
                  color: isActive ? 'white' : 'inherit'
                },
                transition: 'all 0.2s ease',
                justifyContent: 'flex-start',
                px: 2
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'white' : 'primary.main',
                  minWidth: 40,
                  mr: isRTL ? 0 : 2,
                  ml: isRTL ? 2 : 0
                }}
              >
                {item.icon}
              </ListItemIcon>
            
              <ListItemText
                primary={isRTL ? item.arName : item.name}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 500
                  }
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ 
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <SupportIcon sx={{ color: 'primary.main' }} />
        <Typography 
          component="a"
          href="/helper"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          {isRTL ? 'المساعد' : 'Helper'}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            navigate('/login');
          }}
        >
          {t('Navbar.Logout')}
        </Button>

        <Box sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            © 2024 Loyalty System
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      key={isRTL}
      variant="permanent"
      anchor={isRTL ? 'right' : 'left'}
      sx={{
        display: sidebarVisible ? 'block' : 'none',
        '& .MuiDrawer-paper': {
          position: 'relative',
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: !isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          borderLeft: isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
  
};

export default Sidebar;