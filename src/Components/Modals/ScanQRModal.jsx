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
import Spinner from '../../utilities/Spinner';

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
              {isLoading ? <Spinner /> : t("Customers.uploadQRCode")}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("Customers.uploadQRCodeMessage")}
            </Typography>
          </Box>

          <Divider>{t("Customers.or")}</Divider>

          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: 300, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            backgroundColor: 'black'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px',
                zIndex: 2
              }}
            >
              {t("Customers.ScanQRCodeHint")}
            </Typography>

            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              onError={handleError}
              containerStyle={{
                width: '100%',
                height: '100%',
                position: 'absolute'
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            <Box sx={{
              position: 'absolute',
              width: 200,
              height: 200,
              border: '3px solid #4AB814',
              borderRadius: '8px',
              zIndex: 2,
              backgroundColor: 'transparent'
            }} />

            {/* Overlay to darken areas outside scanning frame */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              mask: 'linear-gradient(#000 0 0) center/200px 200px no-repeat',
              WebkitMask: 'linear-gradient(#000 0 0) center/200px 200px no-repeat',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              zIndex: 1
            }} />
          </Box>

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ScanQRModal;
