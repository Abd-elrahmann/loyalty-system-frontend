import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Api from '../../Config/Api';
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useFormik } from 'formik';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FaCoins } from 'react-icons/fa';
import { MailOutlined, PhoneOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
const AddCustomer = ({ open, onClose, isLoading, setIsLoading, fetchCustomers, customer = null }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isEdit = Boolean(customer);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formik.values.enName) newErrors.enName = t('Validation.required');
    if (!formik.values.arName) newErrors.arName = t('Validation.required');
    if (!formik.values.email) {
      newErrors.email = t('Validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formik.values.email)) {
      newErrors.email = t('Validation.invalidEmail');
    }
    if (!formik.values.phone) newErrors.phone = t('Validation.required');
    
    if (!isEdit) {
      if (!formik.values.password) {
        newErrors.password = t('Validation.required');
      } else if (formik.values.password.length < 6) {
        newErrors.password = t('Validation.passwordLength');
      }
      if (!formik.values.confirmPassword) {
        newErrors.confirmPassword = t('Validation.required');
      }
      if (formik.values.password !== formik.values.confirmPassword) {
        newErrors.confirmPassword = t('Validation.passwordMismatch');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (values) => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const dataToSubmit = { 
        ...values,
      };
      if (isEdit) {
        delete dataToSubmit.password;
        delete dataToSubmit.confirmPassword;
          
        await Api.patch(`/api/users/${customer.id}`, dataToSubmit);
        notifySuccess(t('Customers.CustomerUpdated'));
        formik.resetForm();
        onClose();
      } else {
        delete dataToSubmit.points; 
        await Api.post('/api/users', dataToSubmit);
        notifySuccess(t('Customers.CustomerAdded'));
        formik.resetForm();
        onClose();
      }
      await fetchCustomers();
    } catch (error) {
      notifyError(error.response?.data?.message || t('Errors.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      enName: '',
      arName: '',
      email: '',
      phone: '',
      points: 0,
      password: '',
      confirmPassword: '',
      createdAt: new Date()
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (customer) {
      formik.setValues({
        enName: customer.enName || '',
        arName: customer.arName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        points: customer.points || 0,
        role: customer.role || 'USER',
        password: '',
        confirmPassword: '',
        createdAt: customer.createdAt || new Date()
      });
    } else {
      formik.setValues({
        enName: '',
        arName: '',
        email: '',
        phone: '',
        points: 0,
        role: 'USER',
        password: '',
        confirmPassword: '',
        createdAt: new Date()
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <DialogTitle>
        {isEdit ? t('Customers.EditCustomer') : t('Customers.AddCustomer')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('Customers.EnglishName')}
            value={formik.values.enName}
            onChange={(e) => formik.setValues({...formik.values, enName: e.target.value})}
            error={!!errors.enName}
            helperText={errors.enName}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UserOutlined style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('Customers.ArabicName')}
            value={formik.values.arName}
            onChange={(e) => formik.setValues({...formik.values, arName: e.target.value})}
            error={!!errors.arName}
            helperText={errors.arName}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UserOutlined style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('Customers.Email')}
            value={formik.values.email}
            onChange={(e) => formik.setValues({...formik.values, email: e.target.value})}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlined style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label={t('Customers.Phone')}
            value={formik.values.phone}
            onChange={(e) => formik.setValues({...formik.values, phone: e.target.value})}
            error={!!errors.phone}
            type="number"
            helperText={errors.phone}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlined style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                </InputAdornment>
              )
            }}
          />
          {isEdit && (
            <TextField
              label={t('Customers.Points')}
              value={formik.values.points}
              onChange={(e) => formik.setValues({...formik.values, points: e.target.value})}
              error={!!errors.points}
              type="number"
              helperText={errors.points}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaCoins style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                  </InputAdornment>
                )
              }}
            />
          )}
              <FormControl fullWidth>
                <InputLabel id="role-label">{t('Customers.Role')}</InputLabel>
              <Select
                labelId="role-label"
                value={formik.values.role}
                onChange={(e) => formik.setValues({...formik.values, role: e.target.value})}
              >
                <MenuItem value="ADMIN" sx={{ textAlign: isRTL ? 'right' : 'left' }}>{t('Customers.Admin')}</MenuItem>
                <MenuItem value="USER" sx={{ textAlign: isRTL ? 'right' : 'left' }}>{t('Customers.User')}</MenuItem>
              </Select>
              </FormControl>
          {!isEdit && (
            <>
              <TextField
                type={showPassword ? 'text' : 'password'}
                label={t('Customers.Password')}
                value={formik.values.password}
                onChange={(e) => formik.setValues({...formik.values, password: e.target.value})}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff sx={{ color: 'primary.main', fontSize: 20 }} /> : <Visibility sx={{ color: 'primary.main', fontSize: 20 }} />}
                    </IconButton>
                  ),
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                type={showConfirmPassword ? 'text' : 'password'} 
                label={t('Customers.ConfirmPassword')}
                value={formik.values.confirmPassword}
                onChange={(e) => formik.setValues({...formik.values, confirmPassword: e.target.value})}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff sx={{ color: 'primary.main', fontSize: 20 }} /> : <Visibility sx={{ color: 'primary.main', fontSize: 20 }} />}
                    </IconButton>
                  ),
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  )
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 ,flexDirection: isRTL ? 'row-reverse' : 'row'}}>
        <Button onClick={onClose} variant="outlined" size="small" disabled={isLoading}>
          {t('Customers.cancel')}
        </Button>
        <Button onClick={formik.handleSubmit} variant="contained" size="small" disabled={isLoading}>
          {isEdit ? t('Customers.Update') : t('Customers.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomer;
