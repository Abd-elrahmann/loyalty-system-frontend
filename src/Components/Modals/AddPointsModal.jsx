import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Link } from '@mui/material';
import { useTranslation } from "react-i18next";
import Api from "../../Config/Api";
import { notifyError, notifySuccess } from "../../utilities/Toastify";

const AddPointsModal = ({ open, onClose, customer, fetchCustomers }) => {
  const { t, i18n } = useTranslation();
  const [points, setPoints] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    enCurrency: "",
    arCurrency: "",
    pointsPerDollar: 0,
    pointsPerIQD: 0,
    timezone: ""
  });

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      const response = await Api.get('/api/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const calculatePoints = (priceValue) => {
    if (!priceValue) return "";
    
    const calculatedPoints = Math.floor(parseFloat(priceValue) * settings.pointsPerDollar);
    return calculatedPoints.toString();
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    
    const calculatedPoints = calculatePoints(newPrice);
    setPoints(calculatedPoints);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!points || isNaN(points) || points <= 0) {
      notifyError(t("Errors.invalidPoints"));
      return;
    }

    setIsLoading(true);
    try {
      await Api.post(`/api/users/add-points/${customer?.id}`, {
        points: Number(points),
        currency: settings.enCurrency,
        price: price ? Number(price) : null
      });
      
      notifySuccess(`${points} ${t("Customers.pointsAdded")}`);
      await fetchCustomers();
      handleClose();
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPoints("");
    setPrice("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("Customers.AddPoints")}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {t("Customers.Customer")}: {i18n.language === 'ar' ? customer?.arName : customer?.enName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("Customers.CustomerPoints")}: {customer?.points} {t("Customers.Point")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("Customers.NeedToChangeCurrency")} <Link target="_blank" href="/settings" sx={{textDecoration: "none"}}>{t("Customers.GoToSettings")}</Link>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              fullWidth
              label={`${t("Customers.Price")} (${i18n.language === 'ar' ? settings.arCurrency : settings.enCurrency})`}
              type="number"
              value={price}
              onChange={handlePriceChange}
              disabled={isLoading}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
              helperText={`${t("Customers.PointsPerUnit")}: ${settings.enCurrency==="IQD" ? settings.pointsPerIQD : settings.pointsPerDollar} ${t("Customers.Points")}`}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <TextField
              fullWidth
              label={t("Customers.pointsToAdd")}
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              disabled={true}
              required
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleClose} disabled={isLoading}>
            {t("Customers.Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {t("Customers.AddPoints")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPointsModal;
