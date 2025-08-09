import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Api from '../../Config/Api';
import { notifyError, notifySuccess } from '../../utilities/Toastify';

const AddCustomer = ({ open, onClose, isLoading, setIsLoading, fetchCustomers, customer = null }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isEdit = Boolean(customer);

  const [formData, setFormData] = useState({
    enName: '',
    arName: '',
    email: '',
    phone: '',
    points: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        enName: customer.enName || '',
        arName: customer.arName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        points: customer.points || 0,
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        enName: '',
        arName: '',
        email: '',
        phone: '',
        points: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.enName) newErrors.enName = t('Validation.required');
    if (!formData.arName) newErrors.arName = t('Validation.required');
    if (!formData.email) {
      newErrors.email = t('Validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Validation.invalidEmail');
    }
    if (!formData.phone) newErrors.phone = t('Validation.required');
    
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = t('Validation.required');
      } else if (formData.password.length < 6) {
        newErrors.password = t('Validation.passwordLength');
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('Validation.required');
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('Validation.passwordMismatch');
      }
      if (!formData.points) {
        newErrors.points = t('Validation.required');
      }
      if (formData.points < 0) {
        newErrors.points = t('Validation.points');
      } else if (isNaN(formData.points)) {
        newErrors.points = t('Validation.invalidPoints');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
            const dataToSubmit = { 
        ...formData,
        points: parseInt(formData.points) || 0
      };
        if (isEdit) {
          delete dataToSubmit.password;
          delete dataToSubmit.confirmPassword;
          
          await Api.patch(`/api/users/${customer.id}`, dataToSubmit);
        notifySuccess(t('Customers.CustomerUpdated'));
      } else {
        await Api.post('/api/users', dataToSubmit);
        notifySuccess(t('Customers.CustomerAdded'));
      }
      onClose();
      await fetchCustomers();
    } catch (error) {
      notifyError(error.response?.data?.message || t('Errors.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <DialogTitle>
        {isEdit ? t('Customers.EditCustomer') : t('Customers.AddCustomer')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('Customers.EnglishName')}
            value={formData.enName}
            onChange={(e) => setFormData({...formData, enName: e.target.value})}
            error={!!errors.enName}
            helperText={errors.enName}
            fullWidth
          />
          <TextField
            label={t('Customers.ArabicName')}
            value={formData.arName}
            onChange={(e) => setFormData({...formData, arName: e.target.value})}
            error={!!errors.arName}
            helperText={errors.arName}
            fullWidth
          />
          <TextField
            label={t('Customers.Email')}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />
          <TextField
            label={t('Customers.Phone')}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
          />
          <TextField
            label={t('Customers.Points')}
            type="number"
            value={formData.points}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (Number(value) >= 0 && !isNaN(value))) {
                setFormData({...formData, points: value});
              }
            }}
            error={!!errors.points}
            helperText={errors.points}
            fullWidth
            inputProps={{ min: 0 }}
          />
          {!isEdit && (
            <>
              <TextField
                type="password"
                label={t('Customers.Password')}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
              />
              <TextField
                type="password"
                label={t('Customers.ConfirmPassword')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 ,flexDirection: isRTL ? 'row-reverse' : 'row'}}>
        <Button onClick={onClose} disabled={isLoading}>
          {t('Customers.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isEdit ? t('Customers.Update') : t('Customers.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomer;
