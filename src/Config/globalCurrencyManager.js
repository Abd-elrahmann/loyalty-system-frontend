import React from 'react';
import Api from '../Config/Api';
import { useSettings } from '../hooks/useSettings';

const DEFAULT_SETTINGS = {
  enCurrency: '',
  arCurrency: '',
  usdToIqd: 0,
  pointsPerDollar: 0,
  pointsPerIQD: 0
};

class GlobalCurrencyManager {
  constructor() {
    this.currentSettings = { ...DEFAULT_SETTINGS };
    this.listeners = new Set();
    this.isInitialized = false;

    const savedSettings = localStorage.getItem('currencySettings');
    if (savedSettings) {
      try {
        this.currentSettings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing saved currency settings:', error);
      }
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const response = await Api.get('/api/settings');
      if (response.data) {
        this.currentSettings = {
          enCurrency: response.data.enCurrency,
          arCurrency: response.data.arCurrency,
          usdToIqd: response.data.usdToIqd,
          pointsPerDollar: response.data.pointsPerDollar,
          pointsPerIQD: response.data.pointsPerIQD
        };
        localStorage.setItem('currencySettings', JSON.stringify(this.currentSettings));
      }
      this.isInitialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Error initializing currency manager:', error);
      this.isInitialized = true;
    }
  }

  getCurrentDisplayCurrency() {
    return this.currentSettings.enCurrency || DEFAULT_SETTINGS.enCurrency;
  }

  getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1;

    if (fromCurrency === 'USD' && toCurrency === this.currentSettings.enCurrency) {
      return this.currentSettings.usdToIqd || DEFAULT_SETTINGS.usdToIqd;
    }

    if (fromCurrency === this.currentSettings.enCurrency && toCurrency === 'USD') {
      return 1 / (this.currentSettings.usdToIqd || DEFAULT_SETTINGS.usdToIqd);
    }

    return 1;
  }
  
convertAmount(amount, fromCurrency = 'USD', toCurrency = null) {
  const targetCurrency = toCurrency || this.getCurrentDisplayCurrency();
  
  if (fromCurrency === targetCurrency) return amount;
  if (typeof amount !== 'number' || isNaN(amount)) return amount;

  if (fromCurrency === 'USD' && targetCurrency === 'IQD') {
    const rate = this.currentSettings.usdToIqd;
    return rate && rate > 0 ? amount * rate : amount;
  }


  if (fromCurrency === 'IQD' && targetCurrency === 'USD') {
    const rate = this.currentSettings.usdToIqd;
    return rate && rate > 0 ? amount / rate : amount;
  }

  return amount;
}

formatAmount(amount, originalCurrency = 'USD', targetCurrency = null) {
  const displayCurrency = targetCurrency || this.getCurrentDisplayCurrency();
  

  const convertedAmount = this.convertAmount(amount, originalCurrency, displayCurrency);

  const formatted = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: displayCurrency === 'USD' ? 2 : 0,
    maximumFractionDigits: displayCurrency === 'USD' ? 2 : 0
  });

  const symbol = this.getCurrencySymbol(displayCurrency);
  return `${formatted} ${symbol}`;
}

getCurrentCurrency() {
  return this.getCurrentDisplayCurrency();
}
  getCurrencySymbol(currency) {
    if (currency === 'USD') {
      return '$';
    }
    if (currency === this.currentSettings.enCurrency) {
      return 'د.ع';
    }
    return currency;
  }

  async updateSettings(newSettings) {
    try {
      const response = await Api.post('/api/settings', {
        enCurrency: newSettings.enCurrency,
        arCurrency: newSettings.arCurrency,
        usdToIqd: newSettings.usdToIqd,
        pointsPerDollar: newSettings.pointsPerDollar,
        pointsPerIQD: newSettings.pointsPerIQD
      });

      if (response.data) {
        this.currentSettings = {
          enCurrency: response.data.enCurrency,
          arCurrency: response.data.arCurrency,
          usdToIqd: response.data.usdToIqd,
          pointsPerDollar: response.data.pointsPerDollar,
          pointsPerIQD: response.data.pointsPerIQD
        };
        this.notifyListeners();
        localStorage.setItem('currencySettings', JSON.stringify(this.currentSettings));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentSettings);
      } catch (error) {
        console.error('Error notifying currency listener:', error);
      }
    });
  }

  refreshPage() {
    this.notifyListeners();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  getSettings() {
    return { ...this.currentSettings };
  }
}

export const globalCurrencyManager = new GlobalCurrencyManager();

export const useCurrencyManager = () => {
  const { data: settings } = useSettings();
  const [currencySettings, setCurrencySettings] = React.useState(globalCurrencyManager.getSettings());

  React.useEffect(() => {
    if (settings) {
      globalCurrencyManager.currentSettings = {
        enCurrency: settings.enCurrency,
        arCurrency: settings.arCurrency,
        usdToIqd: settings.usdToIqd,
        pointsPerDollar: settings.pointsPerDollar,
        pointsPerIQD: settings.pointsPerIQD
      };
      setCurrencySettings(globalCurrencyManager.getSettings());
    }
  }, [settings]);

  React.useEffect(() => {
    const unsubscribe = globalCurrencyManager.addListener((newSettings) => {
      setCurrencySettings(newSettings);
    });

    return unsubscribe;
  }, []);

  return {
    currentCurrency: globalCurrencyManager.getCurrentDisplayCurrency(),
    settings: currencySettings,
    formatAmount: (amount, originalCurrency = 'USD') =>
      globalCurrencyManager.formatAmount(amount, originalCurrency),
    convertAmount: (amount, fromCurrency, toCurrency) =>
      globalCurrencyManager.convertAmount(amount, fromCurrency, toCurrency),
    updateSettings: (newSettings) =>
      globalCurrencyManager.updateSettings(newSettings),
    refreshPage: () => globalCurrencyManager.refreshPage()
  };
};

export const formatCurrency = (amount, originalCurrency = 'USD') => {
  return globalCurrencyManager.formatAmount(amount, originalCurrency);
};

export const convertCurrency = (amount, fromCurrency, toCurrency = null) => {
  return globalCurrencyManager.convertAmount(amount, fromCurrency, toCurrency);
};

export default globalCurrencyManager;
