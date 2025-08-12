import React from 'react';
import MainLayout from './MainLayout';
import { Box, Container, Typography, Grid, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import heroImg from '../../assets/images/online-loyalty-program-examples.png';
import StarsIcon from '@mui/icons-material/Stars';
import RedeemIcon from '@mui/icons-material/Redeem';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import purchase from '../../assets/images/purchase.webp';
import scanQr from '../../assets/images/scan.webp';
import points from '../../assets/images/points.webp';
import track from '../../assets/images/track.webp';
import rewards from '../../assets/images/redeem.webp';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mui/material';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 * i, duration: 0.6 },
  }),
};

const Home = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 400px)');
  return (
    <MainLayout>
      <Box
        component={motion.div}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        sx={{
          position: 'relative',
          py: { xs: 6, md: 1 },
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center',flexDirection: 'column' }}>
          <Grid container spacing={3} alignItems="center" flexDirection="column" justifyContent="center">
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center',width: '100%' }}>
              <Box
                component={motion.img}
                src={heroImg}
                loading="lazy"
                alt="Loyalty System Platform"
                sx={{
                  width:isMobile ? '90vw' : '100%',
                  height: isMobile ? '300px' : '600px',
                  objectFit: 'cover',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography 
                variant="h1" 
                color="primary" 
                sx={{
                  fontSize: isMobile ? '1.5rem' : '2.2rem',
                  fontWeight: 800,
                  lineHeight:isMobile ? 1.1 : 1.2,
                  mb: isMobile ? 1 : 2,
                  mt: isMobile ? 3 : 4,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '3px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px'
                  }
                }}
              >
                {t('DefaultLayout.TransformYourBusiness')}
              </Typography>
              <Typography 
                color="text.black" 
                sx={{ 
                  mt: 3,
                  mb: isMobile ? 2 : 4,
                  lineHeight: isMobile ? 1.1 : 1.2,
                  fontWeight: 400,
                  fontSize: isMobile ? '1.2rem' : '1.5rem'
                }}
              >
                {t('DefaultLayout.ElevateYourCustomerExperience')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 4 }}
                >
                  {t('DefaultLayout.StartFreeTrial')}
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                >
                  {t('DefaultLayout.LearnMore')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: isMobile ? 2 : 6,mt:3, display: 'flex', flexDirection: 'column', alignItems: 'center' ,backgroundColor:'background.default'}}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            color="primary"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: isMobile ? '1.7rem' : '2.2rem',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                bgcolor: 'primary.main',
                borderRadius: '2px'
              }
            }}
          >
            {t('DefaultLayout.PowerfulFeatures')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Grid container spacing={3} maxWidth="lg" justifyContent="center">
            {[{
              icon: <StarsIcon sx={{ fontSize: 40 }} />,
              title: t('DefaultLayout.Smart'),
              desc: t('DefaultLayout.Auto'),
            }, {
              icon: <RedeemIcon sx={{ fontSize: 40 }} />,
              title: t('DefaultLayout.Rewards'),
              desc: t('DefaultLayout.Customizable'),
            }, {
              icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
              title: t('DefaultLayout.Insights'),
              desc: t('DefaultLayout.Details'),
            }].map((feature, index) => (
              <Grid
                item
                xs={12}
                md={4}
                key={index}
                component={motion.div}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    maxWidth: 300,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(128, 0, 128, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 10px 30px rgba(128, 0, 128, 0.1)',
                      borderColor: 'primary.main',
                      background: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        width: '100%',
        background: 'linear-gradient(135deg, #800080 0%, #4b004b 100%)'
      }}>
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center', mb: 4, maxWidth: 600 }}>
            <Typography
              variant="h2"
              color="white"
              sx={{
                fontWeight:isMobile ? 600 : 700,
                mb: 2,
                fontSize: isMobile ? '1.7rem' : '2.2rem',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  bgcolor: 'white',
                  borderRadius: '2px'
                }
              }}
            >
              {t('DefaultLayout.HowItWorks')}
            </Typography>
            <Typography  color="white" sx={{ opacity: 0.9, mt: 3,fontSize: isMobile ? '1rem' : '1.5rem' }}>
              {t('DefaultLayout.Start')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
            <Grid container spacing={3} maxWidth="lg" justifyContent="center">
              {[
                {
                  text: t('DefaultLayout.Purchase'),
                  image : purchase
                },
                {
                  text: t('DefaultLayout.ScanQRCode'),
                  image: scanQr
                },
                {
                  text: t('DefaultLayout.PointsCredited'),
                  image: points
                },
                {
                  text: t('DefaultLayout.TrackPoints'),
                  image: track
                },
                {
                  text: t('DefaultLayout.RedeemRewards'),
                  image: rewards
                }
              ].map((step, i) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={i}
                  component={motion.div}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      maxWidth: 300,
                      width: isMobile ? '250px' : '210px',
                      height: isMobile ? '230px' : '280px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={step.image}
                      alt={step.text}
                      loading="lazy"
                      sx={{
                        width: 130,
                        height: 100,
                        mb: 2,
                        opacity: 0.9,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <Typography color="white" gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>
                    {t('DefaultLayout.Step')} {i + 1}
                    </Typography>
                    <Typography color="#FFD700" sx={{ fontSize: isMobile ? '1rem' : '1.1rem', opacity: 0.9 }}>
                      {step.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper', width: '100%' }}>
        <Container sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 700,
                mb: 3,
                fontSize: isMobile ? '1.3rem' : '2.2rem',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  bgcolor: 'primary.main',
                  borderRadius: '2px'
                }
              }}
            >
              {t('DefaultLayout.ReadyToGetStarted')}
            </Typography>
            <Typography 
              sx={{ 
                color: 'black',
                mt: 3,
                mb: 4,
                fontWeight: 400,
                fontSize: isMobile ? '1rem' : '1.5rem'
              }}
            >
              {t('DefaultLayout.Join')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large" 
                sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 4 }}
              >
                {t('DefaultLayout.StartFreeTrial')}
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
                sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 4 }}
              >
                {t('DefaultLayout.ContactUs')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

  export default Home;
