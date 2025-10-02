import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, IconButton, useMediaQuery } from '@mui/material';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Api from '../Config/Api';
import { Spin } from "antd";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';
import { FaLock } from 'react-icons/fa';
import ResetPasswordImage from '/assets/images/reset-passwoed.webp';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const ResetPassword = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isMobile = useMediaQuery('(max-width: 600px)');
    const [isExiting, setIsExiting] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const validate = values => {
        const errors = {};
        if (!values.newPassword) {
            errors.newPassword = t('ResetPassword.passwordRequired');
        }
        if (!values.confirmPassword) {
            errors.confirmPassword = t('ResetPassword.confirmPasswordRequired');
        }
        if (values.newPassword !== values.confirmPassword) {
            errors.confirmPassword = t('ResetPassword.missMatchPassword');
        }
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validate,
        onSubmit: async (values) => {
            if (!token) {
                notifyError('Invalid reset token');
                return;
            }
            try {
                setLoading(true);
                const response = await Api.post('/api/auth/reset-password', {
                    newPassword: values.newPassword,
                    token: token
                });
                notifySuccess(response.data.message);
                navigate('/login');
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
                <title>{t('ResetPassword.resetPassword')}</title>
                <meta name="description" content={t('ResetPassword.resetPasswordDescription')} />
            </Helmet>
            
            <Box sx={{ 
                display: 'flex', 
                minHeight: '100vh',
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                {!isMobile && (
                    <Box sx={{
                        flex: 1,
                        background: `url(${ResetPasswordImage}) no-repeat center center`,
                        backgroundSize: 'cover',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: isMobile ? '40vh' : 'auto'
                    }}>
                        <img
                            src={ResetPasswordImage}
                            alt="Reset password background"
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
                            right: 0,
                            width: '100px',
                            height: '100%',
                            background: 'linear-gradient(to bottom right, transparent 50%, #f5f5f5 50%)',
                            transform: isMobile ? 'none' : 'translateX(50%)',
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
                            <Typography component="h1" variant={isMobile ? 'h5' : 'h4'} color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
                                {t('ResetPassword.resetPassword')}
                            </Typography>

                            <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                                <TextField
                                    fullWidth
                                    name="newPassword"
                                    label={t('ResetPassword.enterNewPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    sx={{ mb: 3 }}
                                    value={formik.values.newPassword}
                                    onChange={formik.handleChange}
                                    error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    name="confirmPassword"
                                    label={t('ResetPassword.confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    sx={{ mb: 3 }}
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle confirm password visibility"
                                                    onClick={handleClickShowConfirmPassword}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
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
                                            <FaLock style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />
                                            {t('ResetPassword.resetPassword')}
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

export default ResetPassword;