import { useFormik } from 'formik';
import React from 'react';
const Box = React.lazy(() => import('@mui/material/Box'));
const TextField = React.lazy(() => import('@mui/material/TextField'));
const Button = React.lazy(() => import('@mui/material/Button'));
const Typography = React.lazy(() => import('@mui/material/Typography'));
const Container = React.lazy(() => import('@mui/material/Container'));
const Paper = React.lazy(() => import('@mui/material/Paper'));
import Api from '../Config/Api';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Spinner from '../utilities/Spinner';
import { useState } from 'react';
import Navbar from '../Components/Shared/Navbar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const {t} =useTranslation()
  const [loading, setLoading] = useState(false);
  const validate = values => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validate,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await Api.post('/api/auth/request-reset-password', {
          email: values.email
        });
        notifySuccess(response.data.message);
      } catch (err) {
        notifyError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Navbar />
    <Container component="main" maxWidth="md" sx={{ mt: 13, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 2, mt: 12 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t('ForgetPassword.enterEmail')}
          </Typography>

          <TextField
            fullWidth
            id="email"
            name="email"
            label={t('ForgetPassword.email')}
            type="email"
            sx={{ mb: 3 }}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mb: 2 }}
            disabled={loading}
          >
            {loading ? <Spinner /> : t('ForgetPassword.sendResetLink')}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="span"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 500 }}
              onClick={() => navigate('/login')}
            >
              {t('ForgetPassword.backToLogin')}
            </Typography>
          </Box>
        </Box>        
      </Paper>    
    </Container>
    </>
  );
};

export default ForgetPassword;
