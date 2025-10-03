import { useFormik } from 'formik';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, IconButton, InputAdornment, LinearProgress, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import { useNavigate } from 'react-router-dom';
import Api from '../Config/Api';
import { useTranslation } from 'react-i18next';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GlobalOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { FaUserPlus } from 'react-icons/fa';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import SignUpImage from '/assets/images/signup.webp';
const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const MotionPaper = motion.create(Paper);

const Register = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [shake, setShake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;

    if (/[0-9]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    return score;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 40) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength < 40) return t('Register.weakPassword');
    if (strength < 70) return t('Register.mediumPassword');
    return t('Register.strongPassword');
  };

  const validate = values => {
    const errors = {};

    if (!values.enName) {
      errors.enName = 'English name is required';
    } else if (values.enName.length < 2) {
      errors.enName = 'English name must be at least 2 characters';
    }

    if (!values.arName) {
      errors.arName = 'Arabic name is required';
    } else if (values.arName.length < 2) {
      errors.arName = 'Arabic name must be at least 2 characters';
    }

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]+$/.test(values.phone)) {
      errors.phone = 'Phone number must contain only digits';
    } else if (values.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      enName: '',
      arName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validate,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await Api.post('/api/auth/register', values);
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('profile', JSON.stringify(response.data.user));
        }
        notifySuccess(t('Register.accountCreatedSuccessfullyPleaseLogin'));
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
      } catch (error) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        notifyError(error.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>{t('Register.register')}</title>
        <meta name="description" content={t('Register.registerDescription')} />
      </Helmet>
      
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        flexDirection: isMobile ? 'column' : 'row-reverse'
      }}>
        {!isMobile && (
        <Box sx={{
          flex: 1,
          background: `url(${SignUpImage}) no-repeat center center`,
          backgroundSize: 'cover',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '40vh' : 'auto'
        }}>
          <img
            src={SignUpImage}
            alt="Signup background"
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: isExiting ? 0 : 1, 
                x: isExiting ? -20 : 0 
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              sx={{ 
                p: 4, 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
                backdropFilter: 'blur(10px)',
                animation: shake ? `${shakeAnimation} 0.5s ease-in-out` : 'none',
                borderRadius: 2,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography component="h1" variant={isMobile ? 'h5' : 'h4'} color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('Register.createNewAccount')}
              </Typography>
              <Button onClick={toggleLanguage} sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}>
                <GlobalOutlined style={{marginRight: '8px', marginLeft: '8px', fontSize: '18px', color: '#800080'}} />
                {i18n.language === 'en' ? 'Ar' : 'EN'}
              </Button>
              </Box>
              <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                  <TextField
                    fullWidth
                    name="enName"
                    label={t('Register.enName')}
                    placeholder={isMobile ? '' : t('Register.enName')}
                    value={formik.values.enName}
                    onChange={formik.handleChange}
                    error={formik.touched.enName && Boolean(formik.errors.enName)}
                    helperText={formik.touched.enName && formik.errors.enName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserOutlined style={{color: '#800080'}} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    name="arName"
                    label={t('Register.arName')}
                    placeholder={isMobile ? '' : t('Register.arName')}
                    value={formik.values.arName}
                    onChange={formik.handleChange}
                    error={formik.touched.arName && Boolean(formik.errors.arName)}
                    helperText={formik.touched.arName && formik.errors.arName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserOutlined style={{color: '#800080'}} />
                        </InputAdornment>
                      )
                    }}
                  />    
                </Box>

                <TextField
                  fullWidth
                  name="email"
                  label={t('Register.email')}
                  type="email"
                  placeholder={isMobile ? '' : t('Register.email')}
                  sx={{ mb: 2 }}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
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
                  name="phone"
                  label={t('Register.phone')}
                  placeholder={isMobile ? '' : t('Register.phone')}
                  sx={{ mb: 2 }}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined style={{color: '#800080'}} />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  placeholder={isMobile ? '' : t('Register.password')}
                  sx={{ mb: 1 }}
                  label={t('Register.password')}
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined style={{color: '#800080'}} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <IconButton onClick={togglePasswordVisibility}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setPasswordStrength(checkPasswordStrength(e.target.value));
                  }}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />

                {formik.values.password && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={passwordStrength} 
                      color={getPasswordStrengthColor(passwordStrength)}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography variant="caption" color={getPasswordStrengthColor(passwordStrength)}>
                      {getPasswordStrengthLabel(passwordStrength)}
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  name="confirmPassword"
                  label={t('Register.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={isMobile ? '' : t('Register.confirmPassword')}
                    sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined style={{color: '#800080'}} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <IconButton onClick={toggleConfirmPasswordVisibility}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />

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
                      <FaUserPlus style={{marginRight: '8px', marginLeft: '8px', fontSize: '18px', color: 'white'}} />
                      {t('Register.signUp')}
                    </>
                  )}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('Register.alreadyHaveAccount')}{' '}
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
                        setTimeout(() => navigate('/login'), 300);
                      }}
                    >
                      {t('Register.login')}
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

export default Register;