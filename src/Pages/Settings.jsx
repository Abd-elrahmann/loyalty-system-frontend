import React, { useState, useEffect } from 'react';
import { Box, TextField, Container, Autocomplete, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import moment from 'moment-timezone';
import Api from '../Config/Api';
import { notifySuccess, notifyError } from '../utilities/Toastify';
import { useUser } from '../utilities/user';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Skeleton, Upload } from "antd";
import { SaveOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import { useCurrencyManager } from '../Config/globalCurrencyManager';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';

const Settings = () => {
  const queryClient = useQueryClient();
  const user = useUser();
  const timezones = moment.tz.names();
  const { t, i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { currentSettings: currencySettings, updateSettings: updateCurrencySettings } = useCurrencyManager();

  const currencies = [
    { enValue: 'IQD', arValue: 'الدينار العراقي' },
    { enValue: 'USD', arValue: 'الدولار الأمريكي' }
  ];

  const [settings, setSettings] = useState({
    arTitle: '',
    enTitle: '',
    arDescription: '',
    enDescription: '',
    description: '',
    imgUrl: '',
    image: '',
    enCurrency: null,
    arCurrency: null,
    timezone: 'Asia/Baghdad',
    pointsPerDollar: 0,
    pointsPerIQD: 0,
    usdToIqd: 0,
    printerType: 'USB',
    printerIp: null
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await Api.get('/api/settings');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (data && !settingsMutation.isPending) {
      const currencyObj = currencies.find(c => c.enValue === data.enCurrency);
      
      setSettings(prev => ({
        ...prev,
        arTitle: data.arTitle || '',
        enTitle: data.enTitle || '',
        arDescription: data.arDescription || '',
        enDescription: data.enDescription || '',
        imgUrl: data.imgUrl || '',
        image: data.imgUrl || '',
        pointsPerDollar: parseFloat(data.pointsPerDollar) || 0,
        pointsPerIQD: parseFloat(data.pointsPerIQD) || 0,
        usdToIqd: parseFloat(data.usdToIqd) || 0,
        enCurrency: currencyObj?.enValue || currencySettings?.defaultCurrency || null,
        arCurrency: currencyObj?.arValue || null,
        printerType: data.printerType || 'USB',
        printerIp: data.printerIp || null
      }));
      
      if (data.enCurrency && data.usdToIqd !== undefined) {
        updateCurrencySettings({
          defaultCurrency: data.enCurrency,
          USDtoIQD: data.usdToIqd
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);


  const settingsMutation = useMutation({
    mutationFn: async (settingsToSave) => {
      const formData = new FormData();
      
      Object.keys(settingsToSave).forEach((key) => {
        const value = settingsToSave[key];
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
        }
      });
      

      if (imageFile) {
        formData.append("file", imageFile);
      } else if (settings.imgUrl) {
        formData.append("imgUrl", settings.imgUrl); 
      }
      
      
      return await Api.post('/api/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: (response, variables) => {
      notifySuccess(t('Settings.SettingsSavedSuccessfully'));
      
      updateCurrencySettings({
        defaultCurrency: variables.enCurrency,
        USDtoIQD: variables.usdToIqd
      });
      
      queryClient.setQueryData(['settings'], response.data);
      
      // Clear image state after successful save
      setImageFile(null);
      setImagePreview(null);
      
      // Trigger event to update navbar immediately
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t('Errors.generalError'));
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value === "" ? 0 : parseFloat(value)
    }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      setSettings(prev => ({
        ...prev,
        [i18n.language === 'ar' ? 'arTitle' : 'enTitle']: value
      }));
    } else if (name === 'description') {
      setSettings(prev => ({
        ...prev,
        [i18n.language === 'ar' ? 'arDescription' : 'enDescription']: value
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ 
          ...prev, 
          imgUrl: previewUrl,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // If no new file, clear the preview
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Also clear the current image URL if we want to remove the existing image
    setSettings(prev => ({ 
      ...prev, 
      imgUrl: '',
      image: ''
    }));
    
    // Update the query cache to reflect the image removal
    queryClient.setQueryData(['settings'], (oldData) => ({
      ...oldData,
      imgUrl: ''
    }));
  };

  const handlePrinterChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
      printerIp: value === 'USB' ? null : prev.printerIp
    }));
  };

  const handleCurrencyChange = (newValue) => {
    setSettings(prev => ({
      ...prev,
      enCurrency: newValue ? newValue.enValue : null,
      arCurrency: newValue ? newValue.arValue : null
    }));
  };

  const handleTimezoneChange = (newValue) => {
    setSettings(prev => ({
      ...prev,
      timezone: newValue || 'Asia/Baghdad'
    }));
  };

  const handlePrinterIpChange = (e) => {
    setSettings(prev => ({
      ...prev,
      printerIp: e.target.value
    }));
  };

  const handleSave = () => {
    let settingsToSave;
    if (user.role !== 'USER') {
      settingsToSave = {
        ...settings,
        arTitle: settings.arTitle,
        enTitle: settings.enTitle,
        arDescription: settings.arDescription,
        enDescription: settings.enDescription,
        pointsPerDollar: parseFloat(settings.pointsPerDollar) || 0,
        pointsPerIQD: parseFloat(settings.pointsPerIQD) || 0,
        usdToIqd: parseFloat(settings.usdToIqd) || 0,
        enCurrency: settings.enCurrency,
        arCurrency: settings.arCurrency,
        timezone: settings.timezone,
        printerType: settings.printerType,
        printerIp: settings.printerType === 'LAN' ? settings.printerIp : null
      };
    } else {
      settingsToSave = { timezone: settings.timezone };
    }

    settingsMutation.mutate(settingsToSave);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px" flexDirection="column" gap={2}>
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Skeleton.Input active style={{ width: 300, height: 40 }} />
        <Skeleton.Button active style={{ width: 150, height: 40 }} />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('Settings.Settings')}</title>
        <meta name="description" content={t('Settings.SettingsDescription')} />
      </Helmet>

      <Container maxWidth="md" sx={{ py: 4, mt: 6 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          {user.role !== 'USER' && <Tab label={t('Settings.GeneralSettings')} />}
          {user.role !== 'USER' && <Tab label={t('Settings.CurrencySettings')} />}
          <Tab label={t('Settings.TimezoneSettings')} />
          {user.role !== 'USER' && <Tab label={t('Settings.PrinterSettings')} />}
        </Tabs>

        {/* General Settings Tab */}
        {user.role !== 'USER' && tabIndex === 0 && (
          <Box sx={{ p: 2, maxWidth: '500px', mx: 'auto' }}>
            <TextField
              fullWidth
              size="small"
              name="title"
              label={t('Settings.Title')}
              value={i18n.language === 'ar' ? settings.arTitle : settings.enTitle}
              onChange={handleTextChange}
              sx={{ mb: 2 }}
            />


            <TextField
              fullWidth
              size="small"
              name="description"
              label={t('Settings.Description')}
              value={i18n.language === 'ar' ? settings.arDescription : settings.enDescription}
              onChange={handleTextChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Upload
              name="image"
              onChange={handleImageChange}
              maxCount={1}
              beforeUpload={(file) => {
                console.log(file);
                return false;
              }}
              accept="image/*"
              showUploadList={true}
            >
              <Button
                variant="outlined"
                startIcon={<UploadOutlined />}
                component="span"
                fullWidth
              >
                {t('Settings.UploadImage')}
              </Button>
            </Upload>
            
            {/* Image Preview */}
            {(imagePreview || settings.imgUrl) && (
              <Box sx={{ mt: 2, textAlign: 'center', position: 'relative', display: 'inline-block' }}>
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -1,
                    backgroundColor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'error.dark',
                    },
                    zIndex: 1,
                    width: 20,
                    height: 20,
                    minWidth: 'auto',
                    padding: '4px'
                  }}
                >
                  <CloseOutlined style={{ fontSize: '14px' }} />
                </IconButton>
                <img 
                  src={imagePreview || settings.imgUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '50%', 
                    maxHeight: '100px', 
                    objectFit: 'contain',
                    borderRadius: '4px',
                    position: 'relative',
                    zIndex: 0
                  }} 
                />
              </Box>
            )}
          </Box>
        )}

        {/* Currency Tab */}
        {user.role !== 'USER' && tabIndex === 1 && (
          <Box sx={{ p: 2, maxWidth: '500px', mx: 'auto' }}>
            <Autocomplete
              fullWidth
              name="currency"
              value={currencies.find(c => c.enValue === settings.enCurrency) || null}
              onChange={(event, newValue) => handleCurrencyChange(newValue)}
              options={currencies}
              getOptionLabel={(option) =>
                typeof option === 'string'
                  ? option
                  : i18n.language === 'ar'
                  ? option.arValue
                  : option.enValue
              }
              renderInput={(params) => (
                <TextField {...params} label={t('Settings.ChooseCurrency')} />
              )}
              noOptionsText={t('Settings.NoCurrencies')}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              name="usdToIqd"
              step="0.1"
              label={t('Settings.USDtoIQDRate')}
              value={settings.usdToIqd}
              onChange={handleChange}
              inputProps={{ min: 1, step: 0.1 }}
              sx={{ mt: 2 }}
            />

            {settings.enCurrency && (
              <TextField
                fullWidth
                size="small"
                type="number"
                step="0.1"
                name={settings.enCurrency === 'USD' ? 'pointsPerDollar' : 'pointsPerIQD'}
                label={
                  t(`Settings.EnterPointsPer`) +
                  " " +
                  (i18n.language === 'ar' ? settings.arCurrency : settings.enCurrency)
                }
                value={
                  settings.enCurrency === 'USD'
                    ? settings.pointsPerDollar
                    : settings.pointsPerIQD
                }
                onChange={handleChange}
                inputProps={{ min: 0.1, step: 0.1 }}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        )}

        {/* Timezone Tab */}
        {(user.role !== 'USER' ? tabIndex === 2 : tabIndex === 0) && (
          <Box sx={{ p: 2, maxWidth: '500px', mx: 'auto' }}>
            <Autocomplete
              fullWidth
              name="timezone"
              value={settings.timezone || null}
              onChange={(event, newValue) => handleTimezoneChange(newValue)}
              options={timezones}
              getOptionLabel={(option) => option.replace(/_/g, ' ')}
              renderOption={(props, option) => (
                <li {...props}>
                  {option.replace(/_/g, ' ')} (UTC{moment.tz(option).format('Z')})
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label={t('Settings.Timezone')} />
              )}
            />
          </Box>
        )}

        {/* Printer Settings Tab */}
        {user.role !== 'USER' && tabIndex === 3 && (
          <Box sx={{ p: 2, maxWidth: '500px', mx: 'auto' }}>
            <FormControl fullWidth>
              <InputLabel>{t('Settings.PrinterType')}</InputLabel>
              <Select
                value={settings.printerType}
                name="printerType"
                label={t('Settings.PrinterType')}
                onChange={handlePrinterChange}
              >
                <MenuItem value="USB">USB</MenuItem>
                <MenuItem value="LAN">LAN</MenuItem>
              </Select>
            </FormControl>

            {settings.printerType === 'LAN' && (
              <TextField
                fullWidth
                sx={{ mt: 2 }}
                label={t('Settings.PrinterIP')}
                name="printerIp"
                value={settings.printerIp || ''}
                onChange={handlePrinterIpChange}
              />
            )}
          </Box>
        )}

        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={settingsMutation.isPending}
            size="small"
            startIcon={<SaveOutlined />}
            sx={{ px: 4, fontSize: "12px" }}
          >
            {settingsMutation.isPending ? t('Settings.Saving') : t('Settings.Save')}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Settings;