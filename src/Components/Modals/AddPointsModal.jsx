import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Typography, InputAdornment } from '@mui/material';
import { useTranslation } from "react-i18next";
import Api from "../../Config/Api";
import { notifyError, notifySuccess } from "../../utilities/Toastify";
import { updateUserProfile } from "../../utilities/user";
import { FaCoins } from 'react-icons/fa';

const AddPointsModal = ({ open, onClose, customer, fetchCustomers }) => {
  const { t, i18n } = useTranslation();
  const [points, setPoints] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    try {
      const response = await Api.get('/api/auth/profile');
      if (response.data) {
        localStorage.setItem('profile', JSON.stringify(response.data));
        updateUserProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
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
        points: Number(points)
      });
      await fetchProfile();
      
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
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
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
            <Divider sx={{ my: 2 }} />
            
            <TextField
              fullWidth
              label={t("Customers.pointsToAdd")}
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              inputProps={{ min: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaCoins style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleClose} variant="outlined" size="small" disabled={isLoading}>
            {t("Customers.Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <FaCoins style={{marginRight: '8px', fontSize: '18px', color: 'white'}} />}
          >
            {t("Customers.AddPoints")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPointsModal;
