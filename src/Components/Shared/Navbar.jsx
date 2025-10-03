import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser, updateUserProfile } from '../../utilities/user.jsx';
import Api from '../../Config/Api';
import {MenuOutlined, LogoutOutlined, UserOutlined, SettingOutlined, GlobalOutlined} from '@ant-design/icons';
import { FaCoins } from 'react-icons/fa';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useQuery, useQueryClient } from '@tanstack/react-query';


const Navbar = ({ onMenuClick, sidebarVisible, setSidebarVisible }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 400px)');
  const user = useUser(); 
  const [anchorEl, setAnchorEl] = useState(null);
  const [profile, setProfile] = useState(user);
  const [settings, setSettings] = useState({ 
    arTitle: '', 
    enTitle: '', 
    imgUrl: '' 
  });
  const queryClient = useQueryClient();

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await Api.get('/api/settings');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (settingsData) {
      setSettings({
        arTitle: settingsData.arTitle || '',
        enTitle: settingsData.enTitle || '',
        imgUrl: settingsData.imgUrl || ''
      });
    }
  }, [settingsData]);

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

  useEffect(() => {
    const handleSettingsUpdate = () => {
      // Invalidate the settings query to force refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
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
            >
              <MenuOutlined color='primary' style={{fontSize: isMobile ? '20px' : '21px'}} />
            </IconButton>
          )}
          {settings.arTitle && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              {settings.imgUrl && (
                <img 
                  src={settings.imgUrl} 
                  loading="lazy"
                  alt="Logo" 
                  style={{ 
                    width: isMobile ? 30 : 35, 
                    height: isMobile ? 30 : 35,
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              )}
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.primary', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                {i18n.language === 'ar' ? settings.arTitle : settings.enTitle}
              </Typography>
            </Box>
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
            <GlobalOutlined style={{marginRight: '8px',marginLeft: '8px', fontSize: '18px', color: '#800080'}} />
            {i18n.language === 'en' ? 'Ar' : 'EN'}
          </Button>

          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: isMobile ? 1 : 2 }}>
                <FaCoins style={{color: 'gold', fontSize: isMobile ? '18px' : '20px'}} />
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
                      loading="lazy"
                      src={profile.profileImage}
                      sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
                    />
                  ) : (
                    <SettingOutlined sx={{ color: 'primary.main', fontSize: isMobile ? '22px' : '25px' }} />
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
                    <UserOutlined style={{marginRight: '4px',color: '#800080'}} />
                    {i18n.language === 'en' ? user.enName.split(' ')[0] : user.arName.split('   ')[0]}
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleLogout();
                    setAnchorEl(null);
                  }}>
                    <LogoutOutlined style={{marginRight: '4px',color: 'red'}} />
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
                <FaSignInAlt style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                {t('Navbar.Login')}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                size={isMobile ? "small" : "medium"}
                onClick={() => navigate('/signup')}
                sx={{ px: isMobile ? 3 : 2 }}
              >
                <FaUserPlus style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />
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
