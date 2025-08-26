import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, IconButton } from '@mui/material';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Api from '../Config/Api';
import MainLayout from '../Components/Shared/MainLayout';
import { Spin } from "antd";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';
import { FaLock } from 'react-icons/fa';

const ResetPassword = () => {
    const {t} =useTranslation()
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <MainLayout>
            <Helmet>
                <title>{t('ResetPassword.resetPassword')}</title>
                <meta name="description" content={t('ResetPassword.resetPasswordDescription')} />
            </Helmet>
            <Container component="main" maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 ,mt: 12}}>
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Typography variant="h5" align="center" color="primary" sx={{ mb: 4, fontWeight: 600 }}>
                            {t('ResetPassword.resetPassword')}
                        </Typography>
                        <TextField
                            fullWidth
                            name="newPassword"
                            label={t('ResetPassword.enterNewPassword')}
                            type={showPassword ? 'text' : 'password'}
                            sx={{ mb: 2 }}
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
                            sx={{ mb: 2 }}
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
                            color="primary"
                            size="large"
                            disabled={loading}
                        >
                            {loading ? <Spin size="large" /> : <FaLock style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />}
                            {t('ResetPassword.resetPassword')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </MainLayout>
    );
};

export default ResetPassword;