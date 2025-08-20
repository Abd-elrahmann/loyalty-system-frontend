import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
const Box = React.lazy(() => import('@mui/material/Box'));
const Typography = React.lazy(() => import('@mui/material/Typography'));
const Paper = React.lazy(() => import('@mui/material/Paper'));
const Divider = React.lazy(() => import('@mui/material/Divider'));
const Button = React.lazy(() => import('@mui/material/Button'));
const TextField = React.lazy(() => import('@mui/material/TextField'));
const CircularProgress = React.lazy(() => import('@mui/material/CircularProgress'));
const Container = React.lazy(() => import('@mui/material/Container'));
const Autocomplete = React.lazy(() => import('@mui/material/Autocomplete'));

import moment from 'moment-timezone';
import Api from '../Config/Api';
import { notifySuccess, notifyError } from '../utilities/Toastify';
import { useUser } from '../utilities/user';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enCurrency: null,
    arCurrency: null,
    timezone: 'Asia/Baghdad',
    pointsPerDollar: 0,
    pointsPerIQD: 0
  });
  const user = useUser();
  const timezones = moment.tz.names();

  const currencies = [
    { enValue: 'IQD', arValue: 'الدينار العراقي' },
    { enValue: 'USD', arValue: 'الدولار الأمريكي' }
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await Api.get('/api/settings');
        if (response.data) {
          const currencyObj = currencies.find(c => c.enValue === response.data.enCurrency);
          setSettings({
            ...response.data,
            pointsPerDollar: parseInt(response.data.pointsPerDollar) || 0,
            pointsPerIQD: parseInt(response.data.pointsPerIQD) || 0,
            enCurrency: currencyObj?.enValue || null,
            arCurrency: currencyObj?.arValue || null
          });
        }
      } catch (error) {
        notifyError(error.response?.data?.message || t('Errors.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseInt(value) || null
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let settingsToSave;
      if (user.role === 'ADMIN') {
        settingsToSave = {
          ...settings,
          pointsPerDollar: parseInt(settings.pointsPerDollar) || 0,
          pointsPerIQD: parseInt(settings.pointsPerIQD) || 0,
          enCurrency: settings.enCurrency,
          arCurrency: settings.arCurrency,
          timezone: settings.timezone
        };
      } else {
        settingsToSave = {
          timezone: settings.timezone
        };
      }

      await Api.post('/api/settings', settingsToSave);
      notifySuccess(t('Settings.SettingsSavedSuccessfully'));
      
      const response = await Api.get('/api/settings');
      if (response.data) {
        const currencyObj = currencies.find(c => c.enValue === response.data.enCurrency);
        setSettings({
          ...response.data,
          pointsPerDollar: parseInt(response.data.pointsPerDollar) || null,
          pointsPerIQD: parseInt(response.data.pointsPerIQD) || null,
          enCurrency: currencyObj?.enValue || null,
          arCurrency: currencyObj?.arValue || null
        });
      }
    } catch (error) {
      notifyError(error.response?.data?.message || t('Errors.generalError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, mt: 6 }}>
      {user.role === 'ADMIN' && (
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('Settings.CurrencySettings')}
          </Typography>
          <Divider sx={{ mb: 2 }} />

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
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              return i18n.language === 'ar' ? option.arValue : option.enValue;
            }}
            renderInput={(params) => <TextField {...params} label={t('Settings.ChooseCurrency')} />}
            noOptionsText={t('Settings.NoCurrencies')}
          />
          
          {settings.enCurrency && (
            <TextField
              fullWidth
              size="small"
              type="number"
              name={settings.enCurrency === 'USD' ? 'pointsPerDollar' : 'pointsPerIQD'}
              label={t(`Settings.EnterPointsPer`) + " " + (i18n.language === 'ar' ? settings.arCurrency : settings.enCurrency)}
              value={settings.enCurrency === 'USD' ? settings.pointsPerDollar : settings.pointsPerIQD}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              sx={{ mt: 2 }}
            />
          )}
        </Paper>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 2, mt: user.role === 'ADMIN' ? 0 : 12 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('Settings.TimezoneSettings')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Autocomplete
          fullWidth
          name="timezone"
          value={settings.timezone}
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
          renderInput={(params) => <TextField {...params} label={t('Settings.Timezone')} />}
        />
      </Paper>

      <Box display="flex" justifyContent="center">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          size="small"
          startIcon={saving ? <CircularProgress size={20} /> : null}
          sx={{ px: 4 }}
        >
          {saving ? t('Settings.Saving') : t('Settings.Save')}
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;