import React, { useState, useEffect } from 'react';
import { Box, TextField, Container, Autocomplete, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import moment from 'moment-timezone';
import Api from '../Config/Api';
import { notifySuccess, notifyError } from '../utilities/Toastify';
import { useUser } from '../utilities/user';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from "antd";
import { SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import { useCurrencyManager } from '../Config/globalCurrencyManager';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Settings = () => {
  const queryClient = useQueryClient();
  const user = useUser();
  const timezones = moment.tz.names();
  const { t, i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = React.useRef(null);
  
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
    imgUrl: '',
    image: null,
    imageBase64: '',
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setImageError(true);
        notifyError(t('Settings.ImageSizeError'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // إرسال base64 كامل مع data URL prefix
        setSettings(prev => ({
          ...prev,
          image: file,
          imageBase64: reader.result, // full data URL
          imgUrl: reader.result // For preview
        }));
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const settingsMutation = useMutation({
    mutationFn: async (settingsToSave) => {
      console.log('Sending settings:', settingsToSave);
      
      const payload = {
        ...settingsToSave,
        // إرسال base64 كامل
        image: settingsToSave.imageBase64 || null
      };

      // إزالة الحقول غير الضرورية
      delete payload.imageBase64;
      delete payload.imgUrl;
      
      const response = await Api.post('/api/settings', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response;
    },
    onSuccess: (response, variables) => {
      notifySuccess(t('Settings.SettingsSavedSuccessfully'));
      
      updateCurrencySettings({
        defaultCurrency: variables.enCurrency,
        USDtoIQD: variables.usdToIqd
      });
      
      queryClient.setQueryData(['settings'], response.data);
      
      // Clear image state after successful save
      setSettings(prev => ({
        ...prev,
        image: null,
        imageBase64: '',
        imgUrl: response.data.imgUrl // Use the URL from response
      }));
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Trigger event to update navbar immediately
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
    },
    onError: (error) => {
      console.error('Save error:', error);
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

  const handleRemoveImage = () => {
    setSettings(prev => ({
      ...prev,
      image: null,
      imageBase64: '',
      imgUrl: ''
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setImageError(false);
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
        printerIp: settings.printerType === 'LAN' ? settings.printerIp : null,
        imageBase64: settings.imageBase64 // إرسال base64
      };
    } else {
      settingsToSave = { timezone: settings.timezone };
    }
    
    console.log('Saving settings:', settingsToSave);
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

            <Box sx={{ position: 'relative', mb: 2 }}>
              <input
                ref={fileInputRef}
                accept="image/*"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <Button
                variant="outlined"
                component="span"
                fullWidth
                onClick={() => fileInputRef.current.click()}
                startIcon={<CloudUploadIcon />}
                sx={{
                  mb: 1,
                  borderColor: imageError ? 'error.main' : undefined,
                  color: imageError ? 'error.main' : undefined
                }}
              >
                {t('Settings.UploadImage')}
              </Button>
              
              {/* Image Preview */}
              {settings.imgUrl && (
                <Box sx={{ mt: 2, textAlign: 'center', position: 'relative', display: 'inline-block', width: '100%' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src={settings.imgUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '30%',
                        maxHeight: '80px',
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: '37%',
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.dark',
                        },
                        width: 24,
                        height: 24,
                        padding: '4px'
                      }}
                    >
                      <CloseOutlined style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
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