import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/images/logo.webp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        background: 'linear-gradient(135deg, #800080 0%, #4b004b 100%)',
        color: 'text.main',
        py: 5,
        mt: 5,
        boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6} justifyContent="space-between">
          {/* Logo and Brand Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box
                component="img"
                src={Logo}
                alt="Logo"
                sx={{
                  width: 60,
                  height: 60,
                  filter: 'brightness(1.1)'
                }}
              />
              <Typography variant="h5" color="white" fontWeight="700">
                {t('Navbar.Logo')}
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="white" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
              {t('Footer.QuickLinks')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Link 
                href="/" 
                underline="hover" 
                color="white" 
                sx={{ 
                  opacity: 0.9, 
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    opacity: 1,
                    transform: 'translateX(5px)',
                    color: '#f0f0f0'
                  } 
                }}
              >
                {t('Footer.Home')}
              </Link>
              <Link 
                href="/login" 
                underline="hover" 
                color="white" 
                sx={{ 
                  opacity: 0.9,
                  transition: 'all 0.3s ease', 
                  '&:hover': { 
                    opacity: 1,
                    transform: 'translateX(5px)',
                    color: '#f0f0f0'
                  } 
                }}
              >
                {t('Footer.Login')}
              </Link>
              <Link 
                href="/signup" 
                underline="hover" 
                color="white" 
                sx={{ 
                  opacity: 0.9,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    opacity: 1,
                    transform: 'translateX(5px)',
                    color: '#f0f0f0'
                  } 
                }}
              >
                {t('Footer.SignUp')}
              </Link>
              <Link 
                href="/contact" 
                underline="hover" 
                color="white" 
                sx={{ 
                  opacity: 0.9,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    opacity: 1,
                    transform: 'translateX(5px)',
                    color: '#f0f0f0'
                  } 
                }}
              >
                {t('Footer.Contact')}
              </Link>
            </Box>
          </Grid>

          {/* Social Media / Contact */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="white" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
              {t('Footer.FollowUs')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: '#1877F2',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <FacebookIcon sx={{ color: 'white' }} />
              </IconButton>
              <IconButton 
                href="https://twitter.com" 
                target="_blank"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: '#1DA1F2',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <TwitterIcon sx={{ color: 'white' }} />
              </IconButton>
              <IconButton 
                href="https://instagram.com" 
                target="_blank"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <InstagramIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Footer */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8, 
          pt: 4, 
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Typography variant="body2" color="white" sx={{ opacity: 0.9, letterSpacing: 0.5 }}>
            © {new Date().getFullYear()} Loyalty System. {t('Footer.Copyright')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
