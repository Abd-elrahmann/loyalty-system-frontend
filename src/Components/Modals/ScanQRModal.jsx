import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from '../../utilities/Toastify';

const ScanQRModal = ({ open, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  const handleScan = async (result) => {
    if (result) {
      try {
        // Parse the QR data directly from camera scan
        let qrData;
        try {
          qrData = JSON.parse(result.text);
        } catch {
          notifyError(t("Customers.invalidQRCode"));
          return;
        }

        if (qrData.email) {
          onScanSuccess(qrData.email);
          notifySuccess(t("Customers.qrScanSuccess"));
          onClose();
        } else {
          notifyError(t("Customers.invalidQRCode"));
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
          <Box sx={{ 
            width: '100%',
            height: 400,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                position: 'absolute', 
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
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
              constraints={{
                facingMode: 'environment'
              }}
              onResult={handleScan}
              onError={handleError}
              style={{ width: '100%', height: '100%' }}
              videoId="qr-video"
              scanDelay={500}
              ViewFinder={() => (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  border: '2px solid #4AB814',
                  borderRadius: 2,
                  zIndex: 2
                }} />
              )}
            />
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
