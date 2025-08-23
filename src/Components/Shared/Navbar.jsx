import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useUser, updateUserProfile } from '../../utilities/user.jsx';
import Api from '../../Config/Api';

const Navbar = ({ onMenuClick, sidebarVisible, setSidebarVisible }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 400px)');
  const user = useUser(); 
  const [anchorEl, setAnchorEl] = useState(null);
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      if (user && (!user.points && user.points !== 0) && !user.profileImage) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await Api.get('/api/auth/profile');
            localStorage.setItem('profile', JSON.stringify(response.data));
            updateUserProfile();
          }
        } catch (error) {
          console.warn('Could not fetch profile:', error);
        }
      }
    };

    fetchProfileIfNeeded();
    setProfile(user);
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProfile = JSON.parse(localStorage.getItem('profile'));
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdate', handleStorageChange);
    };
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    updateUserProfile(); 
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: 'white', 
      width: '100%',
      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)', 
      zIndex: theme.zIndex.drawer + 1,
      ...(isMobile && {
        width: '100%',
        right: 'auto',
        left: 'auto',
        transform: 'none',
        borderRadius: 0,
        mt: 0
      })
    }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        display: 'flex', 
        alignItems: 'center', 
        px: isMobile ? 1 : 2,
        minHeight: isMobile ? 48 : 64
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
          {user && (
            <IconButton
              onClick={() => {
                onMenuClick();
                setSidebarVisible(!sidebarVisible);
              }}
              sx={{ color: 'primary.main', mr: 0 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
        </Box>

        <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, alignItems: 'center' }}>
          <Button
            onClick={toggleLanguage}
            sx={{
              color: 'primary.main',
              minWidth: 'auto',
              px: isMobile ? 1 : 2
            }}
          >
            {i18n.language === 'en' ? 'Ar' : 'EN'}
          </Button>

          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: isMobile ? 1 : 2 }}>
                <MonetizationOnIcon sx={{ color: '#FFD700', fontSize: isMobile ? '18px' : '20px' }} />
                <Typography sx={{ color: 'text.primary', fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold' }}>
                  {profile?.points || '0'}
                </Typography>
              </Box>
              
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ p: 0 }}
                >
                  {profile?.profileImage ? (
                    <Avatar 
                      src={profile.profileImage}
                      sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
                    />
                  ) : (
                    <SettingsIcon sx={{ color: 'primary.main', fontSize: isMobile ? '22px' : '25px' }} />
                  )}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => {
                    navigate('/profile');
                    setAnchorEl(null);
                  }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    {i18n.language === 'en' ? user.enName.split(' ')[0] : user.arName.split('   ')[0]}
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleLogout();
                    setAnchorEl(null);
                  }}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    {t('Navbar.Logout')}
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="primary"
                size={isMobile ? "small" : "medium"}
                onClick={() => navigate('/login')}
                sx={{ px: isMobile ? 3 : 2 }}
              >
                {t('Navbar.Login')}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                size={isMobile ? "small" : "medium"}
                onClick={() => navigate('/signup')}
                sx={{ px: isMobile ? 3 : 2 }}
              >
                {t('Navbar.SignUp')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
