import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Api from '../../Config/Api';
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useFormik } from 'formik';
const AddCustomer = ({ open, onClose, isLoading, setIsLoading, fetchCustomers, customer = null }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isEdit = Boolean(customer);

  const [errors, setErrors] = useState({});

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

  const formik = useFormik({
    initialValues: {
      enName: '',
      arName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
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
        password: '',
        confirmPassword: ''
      });
    } else {
      formik.setValues({
        enName: '',
        arName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

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
            value={formik.values.enName}
            onChange={(e) => formik.setValues({...formik.values, enName: e.target.value})}
            error={!!errors.enName}
            helperText={errors.enName}
            fullWidth
          />
          <TextField
            label={t('Customers.ArabicName')}
            value={formik.values.arName}
            onChange={(e) => formik.setValues({...formik.values, arName: e.target.value})}
            error={!!errors.arName}
            helperText={errors.arName}
            fullWidth
          />
          <TextField
            label={t('Customers.Email')}
            value={formik.values.email}
            onChange={(e) => formik.setValues({...formik.values, email: e.target.value})}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />
          <TextField
            label={t('Customers.Phone')}
            value={formik.values.phone}
            onChange={(e) => formik.setValues({...formik.values, phone: e.target.value})}
            error={!!errors.phone}
            type="number"
            helperText={errors.phone}
            fullWidth
          />
          {!isEdit && (
            <>
              <TextField
                type="password"
                label={t('Customers.Password')}
                value={formik.values.password}
                onChange={(e) => formik.setValues({...formik.values, password: e.target.value})}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
              />
              <TextField
                type="password"
                label={t('Customers.ConfirmPassword')}
                value={formik.values.confirmPassword}
                onChange={(e) => formik.setValues({...formik.values, confirmPassword: e.target.value})}
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
        <Button onClick={formik.handleSubmit} variant="contained" disabled={isLoading}>
          {isEdit ? t('Customers.Update') : t('Customers.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomer;
