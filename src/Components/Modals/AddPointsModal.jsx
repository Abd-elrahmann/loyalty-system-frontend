import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Api from "../../Config/Api";
import { notifyError, notifySuccess } from "../../utilities/Toastify";

const AddPointsModal = ({ open, onClose, customer, fetchCustomers }) => {
  const { t } = useTranslation();
  const [points, setPoints] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    currency: null,
    pointsPerDollar: 1,
    pointsPerIQD: 1
  });

  // Fetch settings when modal opens
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

  // Calculate points based on price and settings
  const calculatePoints = (priceValue) => {
    if (!priceValue || !settings.currency) return "";
    
    const pointsPerUnit = settings.currency === 'USD' ? settings.pointsPerDollar : settings.pointsPerIQD;
    const calculatedPoints = Math.floor(parseFloat(priceValue) * pointsPerUnit);
    
    return calculatedPoints.toString();
  };

  // Handle price change and auto-calculate points
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
        currency: settings.currency || 'USD',
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
              {t("Customers.Customer")}: {customer?.enName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("Customers.CustomerPoints")}: {customer?.points}
            </Typography>
            
            {/* Price Input Field */}
            <TextField
              fullWidth
              label={`${t("Customers.Price")} (${settings.currency || 'USD'})`}
              type="number"
              value={price}
              onChange={handlePriceChange}
              disabled={isLoading}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
              helperText={settings.currency ? 
                `${t("Customers.PointsPerUnit")}: ${settings.currency === 'USD' ? settings.pointsPerDollar : settings.pointsPerIQD} ${t("Customers.Points")}` 
                : t("Customers.LoadingSettings")}
            />
            
            <Divider sx={{ my: 2 }} />
            
            {/* Points Display/Input Field */}
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
