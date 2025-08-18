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

const RewardsScanModal = ({ open, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async (result) => {
    if (result && !hasScanned) {
      setHasScanned(true); 
      try {
        let qrData;
        try {
          qrData = JSON.parse(result.text);
        } catch {
          notifyError(t("Rewards.invalidQRCode"));
          onClose();
          return;
        }

        if (qrData.rewardId) {
          onScanSuccess(qrData.rewardId);
          notifySuccess(t("Rewards.qrScanSuccess"));
          onClose();
        } else {
          notifyError(t("Rewards.invalidQRCode"));
          onClose();
        }
      } catch (error) {
        console.log(error);
        notifyError(t("Rewards.qrScanError"));
        onClose();
      }
    }
  };

  const handleError = (error) => {
    if (!hasScanned) {
      console.log(error);
      notifyError(t("Rewards.qrScanError"));
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
      {t("Rewards.ScanQRTitle")}
      <IconButton onClick={onClose} size="small">
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Stack spacing={2}>
        <Box sx={{ 
          width: 150,
          height: 150,
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

export default RewardsScanModal;