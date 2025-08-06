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
        py: 8,
        mt: 'auto',
        boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Logo and Brand Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                component="img"
                src={Logo}
                alt="Logo"
                sx={{
                  width: 50,
                  height: 50,
                }}
              />
              <Typography variant="h5" color="white" fontWeight="600">
                {t('Navbar.Logo')}
              </Typography>
            </Box>
            <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
              {t('Footer.Description') || 'نظام ولاء حديث لمطعمك أو الكوفي الخاص بك، يعزز تجربة العملاء ويزيد من مبيعاتك.'}
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="white" fontWeight="600" gutterBottom>
              {t('Footer.QuickLinks') || 'روابط سريعة'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link href="/" underline="none" color="white" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                {t('Footer.Home') || 'الرئيسية'}
              </Link>
              <Link href="/login" underline="none" color="white" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                {t('Footer.Login') || 'تسجيل الدخول'}
              </Link>
              <Link href="/signup" underline="none" color="white" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                {t('Footer.SignUp') || 'إنشاء حساب'}
              </Link>
              <Link href="/contact" underline="none" color="white" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                {t('Footer.Contact') || 'اتصل بنا'}
              </Link>
            </Box>
          </Grid>

          {/* Social Media / Contact */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="white" fontWeight="600" gutterBottom>
              {t('Footer.FollowUs') || 'تابعنا'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank"
                sx={{ 
                  bgcolor: '#1877F2',
                  '&:hover': { bgcolor: '#0d6efd' }
                }}
              >
                <FacebookIcon sx={{ color: 'white' }} />
              </IconButton>
              <IconButton 
                href="https://twitter.com" 
                target="_blank"
                sx={{ 
                  bgcolor: '#1DA1F2',
                  '&:hover': { bgcolor: '#0c8de4' }
                }}
              >
                <TwitterIcon sx={{ color: 'white' }} />
              </IconButton>
              <IconButton 
                href="https://instagram.com" 
                target="_blank"
                sx={{ 
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                <InstagramIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
            <Typography variant="body1" color="white" sx={{ mt: 3, opacity: 0.9 }}>
              {t('Footer.Email') || 'support@loyalty.com'}
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
            © {new Date().getFullYear()} Loyalty System. {t('Footer.AllRights') || 'جميع الحقوق محفوظة.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
