import { useFormik } from 'formik';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Link, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Api from '../Config/Api';
import { useTranslation } from 'react-i18next';
import { updateUserProfile } from '../utilities/user.jsx';
import { getFirstAccessibleRoute } from '../utilities/permissions.js';
import '../utilities/debugPermissions.js';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';
import { Spin } from "antd";
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { FaSignInAlt } from 'react-icons/fa';
const Login = () => {
  const {t} =useTranslation()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
          
          try {
            const profileResponse = await Api.get('/api/auth/profile');
            const profileData = profileResponse.data;
            
            localStorage.setItem('profile', JSON.stringify(profileData));
            
            const targetRoute = getFirstAccessibleRoute(profileData);
            navigate(targetRoute);
            notifySuccess('Login successful');
            updateUserProfile();
          } catch (profileError) {
            console.warn('Could not fetch full profile, using login data:', profileError);
            
            const targetRoute = getFirstAccessibleRoute(loginUser);
            navigate(targetRoute);
          }
        }

      } catch (error) {
        if (error.response?.data?.message) {
          // Handle array of error messages
          if (Array.isArray(error.response.data.message)) {
            notifyError(error.response.data.message.join(', '));
          } else {
            notifyError(error.response.data.message);
          }
        } else {
          notifyError('Login failed');
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
      <Container component="main" maxWidth= "sm" sx={{ mt: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 ,mt: 8}}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            color="primary"
            sx={{ mb: 4, fontWeight: 600 }}
          >
            {t('Login.login')}
          </Typography>

          <TextField
            fullWidth
            name="emailOrPhone"
            label={t('Login.emailOrPhone')}
            placeholder={t('Login.emailOrPhonePlaceholder')}
            sx={{ mb: 2 }}
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
            placeholder={t('Login.passwordPlaceholder')}
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
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? <Spin size="large" /> : <FaSignInAlt style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />}
            {t('Login.login')}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('Login.dontHaveAccount')}{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: loading ? 'default' : 'pointer', fontWeight: 500, opacity: loading ? 0.5 : 1 }}
                onClick={() => !loading && navigate('/signup')}
              >
                {t('Login.signUp')}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
    </>
  );
};

export default Login;
