import { useFormik } from 'formik';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment } from '@mui/material';
import Api from '../Config/Api';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import { Spin } from "antd";
import { useState } from 'react';
import Navbar from '../Components/Shared/Navbar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope } from 'react-icons/fa';
import { MailOutlined } from '@ant-design/icons';

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
      <Helmet>
        <title>{t('ForgetPassword.forgetPassword')}</title>
        <meta name="description" content={t('ForgetPassword.forgetPasswordDescription')} />
      </Helmet>
    <Container component="main" maxWidth="md" sx={{ mt: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlined style={{color: '#800080'}} />
                </InputAdornment>
              )
            }}
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
            {loading ? <Spin size="large" /> : <FaEnvelope style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />}
            {t('ForgetPassword.sendResetLink')}
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
