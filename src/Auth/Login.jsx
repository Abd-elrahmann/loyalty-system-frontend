import { useFormik } from 'formik';
import React from 'react';
const Box = React.lazy(() => import('@mui/material/Box'));
const TextField = React.lazy(() => import('@mui/material/TextField'));
const Button = React.lazy(() => import('@mui/material/Button'));
const Typography = React.lazy(() => import('@mui/material/Typography'));
const Container = React.lazy(() => import('@mui/material/Container'));
const Paper = React.lazy(() => import('@mui/material/Paper'));
const Link = React.lazy(() => import('@mui/material/Link'));
const IconButton = React.lazy(() => import('@mui/material/IconButton'));
const InputAdornment = React.lazy(() => import('@mui/material/InputAdornment'));
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Spinner from '../utilities/Spinner';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Api from '../Config/Api';
import MainLayout from '../Components/Shared/MainLayout';
import { useTranslation } from 'react-i18next';
import { updateUserProfile } from '../utilities/user.jsx';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

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

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validate,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await Api.post('/api/auth/login', values);
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
       
        notifySuccess('Login successful');
        navigate('/dashboard');
        if (response.data.user) {
          localStorage.setItem('profile', JSON.stringify(response.data.user));
          
          try {
            const profileResponse = await Api.get('/api/auth/profile');
            localStorage.setItem('profile', JSON.stringify(profileResponse.data));
          } catch (profileError) {
            console.warn('Could not fetch full profile:', profileError);
          }
          
          updateUserProfile(); 
        }

      } catch (error) {
        notifyError(error.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <MainLayout>
      <Container component="main" maxWidth= "sm" sx={{ mt: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
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
            name="email"
            label={t('Login.email')}
            sx={{ mb: 2 }}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            name="password"
            label={t('Login.password')}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton onClick={togglePasswordVisibility} disabled={loading}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            sx={{ mb: 2 }}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={loading}
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
            {loading ? <Spinner /> : t('Login.login')}
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
    </MainLayout>
  );
};

export default Login;
