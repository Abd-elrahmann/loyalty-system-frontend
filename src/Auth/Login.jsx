import { useFormik } from 'formik';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Link, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Api from '../Config/Api';
import { useTranslation } from 'react-i18next';
import { updateUserProfile } from '../utilities/user.jsx';
import { getFirstAccessibleRoute } from '../utilities/permissions.js';
import '../utilities/debugPermissions.js';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';
import { MailOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { FaSignInAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import LoginImage from '/assets/images/login.webp';

const MotionPaper = motion(Paper);

const Login = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const {t, i18n} = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validate = values => {
    const errors = {};

    if (!values.emailOrPhone) {
      errors.emailOrPhone = 'Email or phone is required';
    } else if (values.emailOrPhone.includes('@') && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.emailOrPhone)) {
      errors.emailOrPhone = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      emailOrPhone: '',
      password: ''
    },
    validate,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await Api.post('/api/auth/login', {
          emailOrPhone: values.emailOrPhone,
          password: values.password
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
               
        if (response.data.user) {
          const loginUser = response.data.user;
          localStorage.setItem('profile', JSON.stringify(loginUser));
          
          const targetRoute = getFirstAccessibleRoute(loginUser);
          navigate(targetRoute);
          notifySuccess(t('Login.loginSuccessful'));
          updateUserProfile();
        }

      } catch (error) {
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            notifyError(error.response.data.message.join(', '));
          } else {
            notifyError(error.response.data.message);
          }
        } else {
          notifyError(t('Login.loginFailed'));
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Helmet>
        <title>{t('Login.login')}</title>
        <meta name="description" content={t('Login.loginDescription')} />
      </Helmet>
      
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        flexDirection: isMobile ? 'column' : 'row-reverse'
      }}>
        {!isMobile && (
        <Box sx={{
          flex: 1,
          background: `url(${LoginImage}) no-repeat center center`,
          backgroundSize: 'cover',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '40vh' : 'auto'
        }}>
          <img
            src={LoginImage}
            alt="Login background"
            loading="lazy"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100px',
            height: '100%',
            background: 'linear-gradient(to bottom left, transparent 50%, #f5f5f5 50%)',
            transform: isMobile ? 'none' : 'translateX(-50%)',
            display: isMobile ? 'none' : 'block'
          }} />
        </Box>
        )}
        <Box sx={{  
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: isMobile ? 2 : 4
        }}>
          <Container 
            component="main" 
            maxWidth={isMobile ? 'md' : 'sm'} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center'
            }}
          >
            <MotionPaper 
              elevation={3}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isExiting ? 0 : 1, 
                x: isExiting ? 20 : 0 
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              sx={{ 
                p: 4, 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'linear-gradient(to bottom left, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography component="h1" variant={isMobile ? 'h5' : 'h4'} color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('Login.login')}
              </Typography>
              <Button onClick={toggleLanguage} sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}>
                <GlobalOutlined style={{marginRight: '8px', marginLeft: '8px', fontSize: '18px', color: '#800080'}} />
                {i18n.language === 'en' ? 'Ar' : 'EN'}
              </Button>
              </Box>
              <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  name="emailOrPhone"
                  label={t('Login.emailOrPhone')}
                  placeholder={isMobile ? '' : t('Login.emailOrPhonePlaceholder')}
                  sx={{ mb: 2  }}
                  value={formik.values.emailOrPhone}
                  onChange={formik.handleChange}
                  error={formik.touched.emailOrPhone && Boolean(formik.errors.emailOrPhone)}
                  helperText={formik.touched.emailOrPhone && formik.errors.emailOrPhone}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlined style={{color: '#800080'}} />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label={t('Login.password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isMobile ? '' : t('Login.passwordPlaceholder')}
                  sx={{ mb: 2 }}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined style={{color: '#800080'}} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <IconButton onClick={togglePasswordVisibility} disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />

                <Box sx={{ mb: 3, textAlign: 'left' }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/forgot-password');
                    }}
                    sx={{ textDecoration: 'none' }}
                    disabled={loading}
                  >
                    {t('Login.forgotPassword')}
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(45deg, #800080 30%, #FF8E53 90%)',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    py: 1.5,
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6a006a 30%, #e87e45 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(128, 0, 128, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <>
                      <FaSignInAlt style={{marginRight: '8px', marginLeft: '8px', fontSize: '18px', color: 'white'}} />
                      {t('Login.login')}
                    </>
                  )}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('Login.dontHaveAccount')}{' '}
                    <Typography
                      component="span"
                      color="primary"
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 500,
                        textDecoration: 'underline',
                        '&:hover': {
                          color: '#6a006a'
                        }
                      }}
                      onClick={() => {
                        setIsExiting(true);
                        setTimeout(() => navigate('/signup'), 300);
                      }}
                    >
                      {t('Login.signUp')}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </MotionPaper>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Login;
