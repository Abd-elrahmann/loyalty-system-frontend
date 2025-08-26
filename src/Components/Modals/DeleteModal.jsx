import React from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Spin } from "antd";
import { DeleteOutlined } from '@ant-design/icons';
import { CloseOutlined } from '@ant-design/icons';
const DeleteModal = ({ open, onClose, onConfirm, title, message, isLoading, ButtonText}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        {title || t('Customers.DeleteCustomer')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2,
          py: 2 
        }}>
          <FaExclamationTriangle size={48} color="#f44336" />
          <Typography>
            {message || t('Customers.DeleteCustomerMessage')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 2,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        px: 2,
        py: 2,
        pb: 2
      }}>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
          variant="outlined"
          startIcon={<CloseOutlined />}
          size="small"
        >
          { t('Customers.Cancel')}
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained" 
          color={"error"}
          disabled={isLoading}
          startIcon={isLoading ? <Spin size="large" /> : <DeleteOutlined />}
          size="small"
        >
          {isLoading? <Spin size="large" /> : ButtonText || t('Customers.Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
