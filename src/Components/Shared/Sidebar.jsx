import React, { useLayoutEffect, useMemo } from 'react';
const Drawer = React.lazy(() => import('@mui/material/Drawer'));
const List = React.lazy(() => import('@mui/material/List'));
const ListItem = React.lazy(() => import('@mui/material/ListItem'));
const ListItemIcon = React.lazy(() => import('@mui/material/ListItemIcon'));
const ListItemText = React.lazy(() => import('@mui/material/ListItemText'));
const Box = React.lazy(() => import('@mui/material/Box'));
const Typography = React.lazy(() => import('@mui/material/Typography'));
import { useTheme } from '@mui/material';
import { useMediaQuery, Button } from '@mui/material';
import { Support as SupportIcon } from '@mui/icons-material';
import routes from '../../Config/routes.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const drawerWidth = 260;

const Sidebar = ({ onToggle, sidebarVisible }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isRTL = i18n.language === 'ar';

  useLayoutEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const navigationItems = useMemo(() => routes.map(route => ({
    ...route,
    icon: <route.icon />
  })), []);

  const handleNavigation = React.useCallback((path) => {
    requestAnimationFrame(() => {
      navigate(path);
      if (isMobile) {
        onToggle();
      }
    });
  }, [navigate, isMobile, onToggle]);

  const drawerContent = useMemo(() => (
    <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        pt: '64px',
      }}>
      <List sx={{ flex: 1, pt: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                mb: 1,
                mt: 2,
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
                    fontSize: isMobile ? '0.75rem' : '0.95rem',
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
          color="error" 
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
  ), [navigationItems, isRTL, t, location.pathname, isMobile, handleNavigation, navigate]);

  return (
    <Drawer
      key={isRTL}
      variant={isMobile ? "temporary" : "permanent"} 
      anchor={isRTL ? 'right' : 'left'}
      open={sidebarVisible}
      onClose={onToggle}
      sx={{
        display: { xs: 'block', sm: sidebarVisible ? 'block' : 'none' },
        '& .MuiDrawer-paper': {
          position: 'fixed',
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: !isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          borderLeft: isRTL ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
          height: '100%',
          zIndex: (theme) => theme.zIndex.drawer
        },
      }}
      ModalProps={{
        keepMounted: true,
        onClose: onToggle
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default React.memo(Sidebar);