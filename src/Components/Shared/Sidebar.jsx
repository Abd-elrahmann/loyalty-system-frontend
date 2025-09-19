import React, { useLayoutEffect, useMemo } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useMediaQuery, Button } from '@mui/material';
import { Support as SupportIcon } from '@mui/icons-material';
import routes from '../../Config/routes.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../utilities/user.jsx';
import { filterRoutesByPermissions } from '../../utilities/permissions.js';
import { LogoutOutlined } from '@ant-design/icons';
const drawerWidth = 260;

const Sidebar = ({ onToggle, sidebarVisible, open }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isRTL = i18n.language === 'ar';
  const user = useUser(); 

  const toggleSidebar = () => {
    onToggle?.();
  }

  
  useLayoutEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);
  
  const navigationItems = useMemo(() => {
    const filteredRoutes = filterRoutesByPermissions(routes, user);
    return filteredRoutes.map(route => ({
      ...route,
      icon: <route.icon />
    }));
  }, [user]);

  const handleNavigation = React.useCallback((path) => {
    requestAnimationFrame(() => {
      navigate(path);
      if (isMobile) {
        onToggle?.();
      }
    });
  }, [navigate, isMobile, onToggle]);

  const drawerContent = useMemo(() => (
    <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        pt: '64px',
        overflowY: 'auto',
      }}>
      <List sx={{ flex: 1, pt: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) onToggle?.();
              }}
              sx={{
                mx: 1,
                mb: 1,
                mt: user.role === "ADMIN" ? 2 : 3,
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
                transition: 'background-color 0.1s ease',
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
                    fontSize: isMobile ? '0.75rem' : '0.95rem',
                    fontWeight: isActive ? 600 : 500
                  }
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Button 
          variant="contained" 
          color="error" 
          fullWidth
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            navigate('/login');
          }}
          size="small"
        >
          <LogoutOutlined style={{marginRight: '4px'}} />
          {t('Navbar.Logout')}
        </Button>
      </Box>
    </Box>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [navigationItems, isRTL, t, location.pathname, isMobile, handleNavigation, navigate, toggleSidebar]);

  return (
    <Drawer
      key={isRTL}
      variant={isMobile ? "temporary" : "permanent"} 
      anchor={isRTL ? 'right' : 'left'}
      open={isMobile ? open : sidebarVisible}
      onClose={onToggle}
      sx={{
        display: { xs: 'block', sm: sidebarVisible ? 'block' : 'none' },
        '& .MuiDrawer-paper': {
          position: isRTL ? 'relative' : 'fixed',
          width: drawerWidth, 
          boxSizing: 'border-box',
          border: 'none',
          borderRight: !isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          borderLeft: isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          height: '100vh',
          zIndex: (theme) => theme.zIndex.drawer,
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default React.memo(Sidebar);