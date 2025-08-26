import { useFormik } from 'formik';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, IconButton, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import { Spin } from "antd";
import { useNavigate } from 'react-router-dom';
import Api from '../Config/Api';
import MainLayout from '../Components/Shared/MainLayout';
import { useTranslation } from 'react-i18next';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { PhoneOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const {t} = useTranslation()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        await Api.post('/api/auth/register', values);
        localStorage.setItem('profile', JSON.stringify(values));
        notifySuccess('Account created successfully');
        navigate('/login');
      } catch (error) {
        notifyError(error.response.data.message);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <MainLayout>
      <Helmet>
        <title>{t('Register.register')}</title>
        <meta name="description" content={t('Register.registerDescription')} />
      </Helmet>
      <Container component="main" maxWidth="sm" sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: isMobile ? '90vw' : '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5" color="primary" sx={{ mb: 3 }}>
          {t('Register.createNewAccount')}
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2,flexDirection:isMobile ? 'column' : 'row' }}>
            <TextField
              fullWidth
              name="enName"
              label={t('Register.enName')}
              value={formik.values.enName}
              onChange={formik.handleChange}
              error={formik.touched.enName && Boolean(formik.errors.enName)}
              helperText={formik.touched.enName && formik.errors.enName}
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
              name="arName"
              label={t('Register.arName')}
              value={formik.values.arName}
              onChange={formik.handleChange}
              error={formik.touched.arName && Boolean(formik.errors.arName)}
              helperText={formik.touched.arName && formik.errors.arName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlined style={{color: '#800080'}} />
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
            sx={{ mb: 2 }}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
         
          />

          <TextField
            fullWidth
            name="confirmPassword"
            label={t('Register.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
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
            sx={{ mb: 3 }}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
           
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? <Spin size="large" /> : <FaUserPlus style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />}
            {t('Register.signUp')}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('Register.alreadyHaveAccount')}{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/login')}
              >
                {t('Register.login')}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
    </MainLayout>
  );
};

export default Register;
