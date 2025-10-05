import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { DownloadOutlined, ShareAltOutlined , CloseOutlined } from "@ant-design/icons";
import { notifySuccess, notifyError } from "../../utilities/Toastify";

const ShowQrModal = ({ open, onClose, customer }) => {
  const { t, i18n } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!customer) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(customer.qrCode);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_${customer.enName || customer.arName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      notifySuccess(t("Customers.QRDownloadSuccess"));
    } catch (error) {
      console.error("Error downloading QR code:", error);
      notifyError(t("Errors.generalError"));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const response = await fetch(customer.qrCode);
        const blob = await response.blob();
        const file = new File([blob], `QR_${customer.enName || customer.arName}.png`, { type: "image/png" });
        
        await navigator.share({
          title: `${customer.enName || customer.arName} QR Code`,
          text: `QR Code for ${customer.enName || customer.arName}`,
          files: [file],
        });
      } else {
        await handleDownload();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error sharing QR code:", error);
        notifyError(t("Errors.generalError"));
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="span">
          {t("Customers.QRCode")}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: "center", py: 3 }}>
        <Typography variant="h6" gutterBottom>
          {i18n.language === 'ar' ? customer.arName : customer.enName}
        </Typography>
        
        <Box
          component="img"
          src={customer.qrCode}
          alt="QR Code"
          sx={{
            width: 200,
            height: 200,
            objectFit: "contain",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 1,
            mb: 2,
          }}
        />
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2, flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}>
        <Button
          variant="contained"
          startIcon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={isDownloading}
          sx={{
            minWidth: 120,
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          {t("Customers.Download")}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ShareAltOutlined />}
          onClick={handleShare}
          sx={{
            minWidth: 120,
            borderColor: "primary.main",
            color: "primary.main",
            "&:hover": {
              borderColor: "primary.dark",
              backgroundColor: "primary.light",
            },
          }}
        >
          {t("Customers.Share")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowQrModal;