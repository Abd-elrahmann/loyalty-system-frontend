import React, { useState } from "react";
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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Api from "../../Config/Api";
import { notifyError, notifySuccess } from "../../utilities/Toastify";

const AddPointsModal = ({ open, onClose, customer, fetchCustomers }) => {
  const { t } = useTranslation();
  const [points, setPoints] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!points || isNaN(points) || points <= 0) {
      notifyError(t("Errors.invalidPoints"));
      return;
    }

    setIsLoading(true);
    try {
      await Api.post(`/api/users/${customer?.id}/points`, {
        points: Number(points)
      });
      
      notifySuccess(t("Customers.pointsAdded"));
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
            <TextField
              fullWidth
              label={t("Customers.pointsToAdd")}
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              disabled={isLoading}
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
