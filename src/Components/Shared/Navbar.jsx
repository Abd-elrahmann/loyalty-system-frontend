import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.webp';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white',width: '100%' }}>
      <Toolbar sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

        {/* Right Side Items */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Language Toggle */}
          <Button
            onClick={toggleLanguage}
            sx={{
              color: 'primary.main',
              minWidth: 'auto'
            }}
          >
            {i18n.language === 'en' ? 'Ar' : 'EN'}
          </Button>

          {/* Auth Buttons */}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
