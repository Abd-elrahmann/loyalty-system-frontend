import { useFormik } from 'formik';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, useMediaQuery } from '@mui/material';
import Api from '../Config/Api';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import { Spin } from "antd";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope } from 'react-icons/fa';
import { MailOutlined, GlobalOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ForgetPasswordImage from '/assets/images/forget-password.webp';

const MotionPaper = motion(Paper);

const ForgetPassword = () => {
  const navigate = useNavigate();
  const {t, i18n} = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [isExiting, setIsExiting] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const validate = values => {
    const errors = {};

    if (!values.email) {
      errors.email = t('ForgetPassword.emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = t('ForgetPassword.invalidEmailAddress');
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
        notifyError(err.response?.data?.message || t('ForgetPassword.anErrorOccurred'));
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
      
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        flexDirection: isMobile ? 'column' : 'row-reverse'
      }}>
        {!isMobile && (
        <Box sx={{
          flex: 1,
          background: `url(${ForgetPasswordImage}) no-repeat center center`,
          backgroundSize: 'cover',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '40vh' : 'auto'
        }}>
          <img
            src={ForgetPasswordImage}
            alt="Forget password background"
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
                borderRadius: 2,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography component="h1" variant={isMobile ? 'h5' : 'h4'} color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('ForgetPassword.forgetPassword')}
              </Typography>
              <Button onClick={toggleLanguage} sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}>
                <GlobalOutlined style={{marginRight: '8px', marginLeft: '8px', fontSize: '18px', color: '#800080'}} />
                {i18n.language === 'en' ? 'Ar' : 'EN'}
              </Button>
              </Box>
              <Typography 
                variant="body1" 
                align="center" 
                color="text.secondary"
                sx={{ mb: 3, fontSize: isMobile ? '14px' : '16px' }}
              >
                {t('ForgetPassword.enterEmail')}
              </Typography>

              <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  name="email"
                  label={t('ForgetPassword.email')}
                  type="email"
                  sx={{ mb: 3 }}
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
                    <Spin size={isMobile ? 'medium' : 'large'} />
                  ) : (
                    <>
                      <FaEnvelope style={{marginRight: '8px', marginLeft: '8px', fontSize: '18px', color: 'white'}} />
                      {t('ForgetPassword.sendResetLink')}
                    </>
                  )}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
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
                      {t('ForgetPassword.backToLogin')}
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

export default ForgetPassword;
