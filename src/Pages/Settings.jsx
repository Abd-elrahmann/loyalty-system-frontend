import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Container, Autocomplete, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import moment from 'moment-timezone';
import Api from '../Config/Api';
import { notifySuccess, notifyError } from '../utilities/Toastify';
import { useUser } from '../utilities/user';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Spin } from "antd";
import { SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@mui/material/Button';

const Settings = () => {
  const queryClient = useQueryClient();
  const user = useUser();
  const timezones = moment.tz.names();
  const { t, i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const currencies = [
    { enValue: 'IQD', arValue: 'الدينار العراقي' },
    { enValue: 'USD', arValue: 'الدولار الأمريكي' }
  ];

  const [settings, setSettings] = useState({
    enCurrency: null,
    arCurrency: null,
    timezone: 'Asia/Baghdad',
    pointsPerDollar: 0,
    pointsPerIQD: 0,
    printerType: 'USB',
    printerIp: null
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await Api.get('/api/settings');
      return response.data;
    },
    staleTime: 30000,
    gcTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  useEffect(() => {
    if (data) {
      const currencyObj = currencies.find(c => c.enValue === data.enCurrency);
      setSettings({
        ...data,
        pointsPerDollar: parseInt(data.pointsPerDollar) || 0,
        pointsPerIQD: parseInt(data.pointsPerIQD) || 0,
        enCurrency: currencyObj?.enValue || null,
        arCurrency: currencyObj?.arValue || null,
        printerType: data.printerType || 'USB',
        printerIp: data.printerIp || null
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const settingsMutation = useMutation({
    mutationFn: async (settingsToSave) => {
      return await Api.post('/api/settings', settingsToSave);
    },
    onSuccess: () => {
      notifySuccess(t('Settings.SettingsSavedSuccessfully'));
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t('Errors.generalError'));
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value === "" ? 0 : parseInt(value)
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

  const handleSave = () => {
    let settingsToSave;
    if (user.role === 'ADMIN') {
      settingsToSave = {
        ...settings,
        pointsPerDollar: parseInt(settings.pointsPerDollar) || 0,
        pointsPerIQD: parseInt(settings.pointsPerIQD) || 0,
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <Spin size="large" />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('Settings.Settings')}</title>
        <meta name="description" content={t('Settings.SettingsDescription')} />
      </Helmet>

      <Container maxWidth="sm" sx={{ py: 4, mt: 6 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          {user.role === 'ADMIN' && <Tab label={t('Settings.CurrencySettings')} />}
          <Tab label={t('Settings.TimezoneSettings')} />
          {user.role === 'ADMIN' && <Tab label={t('Settings.PrinterSettings')} />}
        </Tabs>

        {/* Currency Tab */}
        {user.role === 'ADMIN' && tabIndex === 0 && (
          <Box sx={{ p: 2 }}>
            <Autocomplete
              fullWidth
              name="currency"
              value={currencies.find(c => c.enValue === settings.enCurrency) || null}
              onChange={(event, newValue) => {
                setSettings(prev => ({
                  ...prev,
                  enCurrency: newValue ? newValue.enValue : null,
                  arCurrency: newValue ? newValue.arValue : null
                }));
              }}
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

            {settings.enCurrency && (
              <TextField
                fullWidth
                size="small"
                type="number"
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
                inputProps={{ min: 1 }}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        )}

        {/* Timezone Tab */}
        {(user.role === 'ADMIN' ? tabIndex === 1 : tabIndex === 0) && (
          <Box sx={{ p: 2 }}>
            <Autocomplete
              fullWidth
              name="timezone"
              value={settings.timezone || null}
              onChange={(event, newValue) => {
                setSettings(prev => ({
                  ...prev,
                  timezone: newValue || 'Asia/Baghdad'
                }));
              }}
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
        {user.role === 'ADMIN' && tabIndex === 2 && (
          <Box sx={{ p: 2 }}>
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
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  printerIp: e.target.value
                }))}
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
            {settingsMutation.isPending ? t('General.Saving') : t('Settings.Save')}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Settings;
