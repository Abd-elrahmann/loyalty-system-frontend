import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { Visibility } from '@mui/icons-material';
import dayjs from "dayjs";

const InvoiceCard = ({ invoice, onViewInvoice, t }) => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2,
        border: '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <Stack spacing={2}>
        {/* Header with ID */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t("Invoice.ID")}: {invoice.id}
          </Typography>
          <Button 
            onClick={() => onViewInvoice(invoice.id)}
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
          >
            {t("Invoice.ViewInvoice")}
          </Button>
        </Box>

        <Divider />

        {/* Customer Info */}
        <Stack spacing={1}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t("Invoice.Customer")}:
            </Typography>
            <Typography variant="body1">
              {invoice.user ? 
                (localStorage.getItem('i18nextLng') === 'ar' ? 
                  invoice.user.arName : invoice.user.enName) 
                : t('Invoice.guest')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("Invoice.Phone")}:
              </Typography>
              <Typography variant="body1">
                {invoice.phone || '-'}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("Invoice.Email")}:
              </Typography>
              <Typography variant="body1">
                {invoice.email || '-'}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Divider />

        {/* Invoice Details */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t("Invoice.Total")}:
            </Typography>
            <Typography variant="body1" color="primary.main" fontWeight="bold">
              ${invoice.totalPrice}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t("Invoice.Points")}:
            </Typography>
            <Typography variant="body1" color="success.main" fontWeight="bold">
              {invoice.points}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t("Invoice.Date")}:
            </Typography>
            <Typography variant="body1">
              {dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default InvoiceCard;
