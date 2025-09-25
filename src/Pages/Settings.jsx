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
import { useCurrencyManager } from '../Config/globalCurrencyManager';

const Settings = () => {
  const queryClient = useQueryClient();
  const user = useUser();
  const timezones = moment.tz.names();
  const { t, i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  
  // Use Global Currency Manager
  const { currentSettings: currencySettings, updateSettings: updateCurrencySettings } = useCurrencyManager();

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
    if (data && !settingsMutation.isLoading) {
      const currencyObj = currencies.find(c => c.enValue === data.enCurrency);
      setSettings({
        ...data,
        pointsPerDollar: parseFloat(data.pointsPerDollar) || 0,
        pointsPerIQD: parseFloat(data.pointsPerIQD) || 0,
        usdToIqd: parseFloat(data.usdToIqd) || 0,
        enCurrency: currencyObj?.enValue || currencySettings?.defaultCurrency || null,
        arCurrency: currencyObj?.arValue || null,
        printerType: data.printerType || 'USB',
        printerIp: data.printerIp || null
      });
      
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
      return await Api.post('/api/settings', settingsToSave);
    },
    onSuccess: (response, variables) => {
      notifySuccess(t('Settings.SettingsSavedSuccessfully'));
      
      updateCurrencySettings({
        defaultCurrency: variables.enCurrency,
        USDtoIQD: variables.usdToIqd
      });
      
      queryClient.setQueryData(['settings'], response.data || variables);
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
          {user.role !== 'USER' && <Tab label={t('Settings.CurrencySettings')} />}
          <Tab label={t('Settings.TimezoneSettings')} />
          {user.role !== 'USER' && <Tab label={t('Settings.PrinterSettings')} />}
        </Tabs>

        {/* Currency Tab */}
        {user.role !== 'USER' && tabIndex === 0 && (
          <Box sx={{ p: 2 }}>
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
        {(user.role !== 'USER' ? tabIndex === 1 : tabIndex === 0) && (
          <Box sx={{ p: 2 }}>
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
        {user.role !== 'USER' && tabIndex === 2 && (
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
