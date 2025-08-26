import React, { useState } from 'react';
import { Box, IconButton, Stack, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useMediaQuery } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';
const ScanQRModal = ({ open, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const handleScan = async (result) => {
    if (result && !hasScanned) {
      setHasScanned(true); 
      try {
        let qrData;
        try {
          qrData = JSON.parse(result.text);
        } catch {
          notifyError(t("Customers.invalidQRCode"));
          onClose();
          return;
        }

        if (qrData.email) {
          onScanSuccess(qrData.email);
          notifySuccess(t("Customers.qrScanSuccess"));
          onClose();
        } else {
          notifyError(t("Customers.invalidQRCode"));
          onClose();
        }
      } catch (error) {
        console.log(error);
        notifyError(t("Customers.invalidQRCode"));
        onClose();
      }
    }
  };

  const handleError = (error) => {
    if (!hasScanned) {
      console.log(error);
      notifyError(t("Customers.qrScanError"));
      setHasScanned(true);
      onClose();
    }
  };

  React.useEffect(() => {
    if (open) {
      setHasScanned(false);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t("Customers.ScanQRCode")}
        <IconButton onClick={onClose} size="small" sx={{ fontSize: '12px' }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Stack spacing={2}>
          <Box sx={{ 
            width: isMobile ? 250 : 200,
            height: isMobile ? 250 : 200,
            position: 'relative',
            overflow: 'hidden',
            margin: '0 auto'
          }}>
          
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
                  width: isMobile ? 300 : 200,
                  height: isMobile ? 300 : 200,
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
