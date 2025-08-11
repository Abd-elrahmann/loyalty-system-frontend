import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  IconButton,
  Button,
  Stack,
  Typography,
  Divider
} from '@mui/material';
import { Close, Upload } from '@mui/icons-material';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from "react-i18next";
import Api from "../../Config/Api";
import { notifyError, notifySuccess } from '../../utilities/Toastify';

const ScanQRModal = ({ open, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleScan = async (result) => {
    if (result) {
      try {
        const response = await Api.post('/api/users/scan-qr', {
          qrData: result?.text
        });
        
        if (response?.data?.qrData?.email) {
          onScanSuccess(response.data.qrData.email);
          onClose();
        }
      } catch (error) {
        console.log(error);
        notifyError(t("Customers.invalidQRCode"));
      }
    }
  };

  const handleError = (error) => {
    console.log(error);
    notifyError(t("Customers.qrScanError"));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('qrImage', file);

    try {
      const response = await Api.post('/api/users/scan-qr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        transformRequest: [function () {
          return formData;
        }]
      });

      if (response?.data?.qrData?.email) {
        onScanSuccess(response.data.qrData.email);
        notifySuccess(t("Customers.uploadQRCodeSuccess"));
        onClose();
      } else {
        notifyError(t("Customers.uploadQRCodeNotFound"));
      }
    } catch (error) {
      console.log('Upload error:', error.response || error);
      notifyError(t("Customers.uploadQRCodeFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t("Customers.ScanQRCode")}
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {t("Customers.uploadQRCode")}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("Customers.uploadQRCodeMessage")}
            </Typography>
          </Box>

          <Divider>{t("Customers.or")}</Divider>

          <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("Customers.ScanQRCodeHint")}
            </Typography>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              onError={handleError}
              style={{ width: '100%' }}
            />
          </Box>

          {error && (
            <Box sx={{ color: 'error.main', textAlign: 'center' }}>
              {error}
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ScanQRModal;
