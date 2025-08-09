import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Avatar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.webp';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Api from '../../Config/Api';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
const Navbar = ({ onMenuClick, sidebarVisible, setSidebarVisible }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await Api.get('/api/auth/profile');
        setProfile(response.data);
        localStorage.setItem('profile', JSON.stringify(response.data)); 
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const profileData = localStorage.getItem('profile');
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
    }
  };

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
    <AppBar position="static" sx={{ backgroundColor: 'white',width: '100%',boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)', zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <IconButton
              onClick={isMobile ? onMenuClick : () => setSidebarVisible(!sidebarVisible)}
              sx={{ color: 'primary.main', mr: 0 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <img src={Logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            {t('Navbar.Logo')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            onClick={toggleLanguage}
            sx={{
              color: 'primary.main',
              minWidth: 'auto'
            }}
          >
            {i18n.language === 'en' ? 'Ar' : 'EN'}
          </Button>

          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5,mr:2 }}>
                <MonetizationOnIcon sx={{ color: '#FFD700', fontSize: '20px' }} />
                <Typography sx={{ color: 'text.primary', fontSize: '16px', fontWeight: 'bold' }}>
                  {profile?.points || ''}
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
                      sx={{ width: 40, height: 40 }}
                    />
                  ) : (
                   <SettingsIcon sx={{ color: 'primary.main', fontSize: '25px' }} />
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
                    {i18n.language === 'en' ? user.enName.split(' ')[0] : user.arName.split('  ')}
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
                onClick={() => navigate('/login')}
              >
                {t('Navbar.Login')}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/signup')}
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
