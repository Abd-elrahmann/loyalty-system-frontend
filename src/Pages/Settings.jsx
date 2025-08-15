import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Container,
  Autocomplete
} from '@mui/material';
import moment from 'moment-timezone';
import Api from '../Config/Api';
import { notifySuccess, notifyError } from '../utilities/Toastify';

const Settings = () => {
  const { t,i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    currency: '',
    timezone: 'Asia/Baghdad',
    pointsConversion: 1
  });

  // Get all timezones using moment-timezone
  const timezones = moment.tz.names();

  const currencies = [
    { enValue: 'IQD', arValue: 'IQD (الدينار العراقي)' },
    { enValue: 'USD', arValue: 'USD (الدولار الأمريكي)' }
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await Api.get('/api/settings');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        notifyError(error.response?.data?.message || t('Errors.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Api.put('/api/settings', settings);
      notifySuccess(t('Settings.SavedSuccessfully'));
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
    <Container maxWidth="sm" sx={{ py: 4,mt:6 }}>
    
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('Settings.CurrencySettings')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Autocomplete
          fullWidth
          labelId="currency-label"
          name="currency"
          value={settings.currency}
          onChange={(event, newValue) => {
            setSettings(prev => ({
              ...prev,
              currency: newValue
            }));
          }}
          options={currencies}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return i18n.language === 'ar' ? option.arValue : option.enValue;
          }}
          renderInput={(params) => <TextField {...params} label={t('Settings.Currency')} />}
          noOptionsText={t('Settings.NoCurrencies')}
        />

        {settings.currency && (
          <TextField
            fullWidth
            size="small"
            type="number"
            name="pointsConversion"
            label={`Enter how many points for each 1 ${i18n.language === 'ar' ? settings.currency.arValue : settings.currency.enValue}`}
            value={settings.pointsConversion}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mt: 2 }}
          />
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('Settings.TimezoneSettings')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Autocomplete
          fullWidth
          labelId="timezone-label"
          name="timezone"
          value={settings.timezone}
          onChange={handleChange}
          label={t('Settings.Timezone')}
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