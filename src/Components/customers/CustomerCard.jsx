import React from "react";
import {
  Box,
  Stack,
  IconButton,
  Link,
  Chip,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { EyeOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const CustomerCard = ({ customer, onShowQR, onAddPoints, onEdit, onDelete, onViewTransactions }) => {
  const { t, i18n } = useTranslation();

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.ID")}:
            </Typography>
            <Typography variant="body2">{customer.id}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Name")}:
            </Typography>
            <Typography variant="body2">
              {i18n.language === 'ar' ? customer.arName : customer.enName}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Role")}:
            </Typography>
            <Chip
              label={i18n.language === 'ar' ? 
                customer.role === 'ADMIN' ? 'مدير عام' :
                customer.role === 'ACCOUNTANT' ? 'محاسب' :
                customer.role === 'CASHIER' ? 'كاشير' :
                'عميل'
                : customer.role
              }
              size="small"
              sx={{
                fontSize: i18n.language === 'ar' ? '14px' : '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'white',
                backgroundColor: 
                  customer.role === 'ADMIN' ? '#1677FF' : 
                  customer.role === 'ACCOUNTANT' ? '#FFA500' :
                  customer.role === 'CASHIER' ? '#800080' :
                  '#4CAF50',
                height: '24px'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Email")}:
            </Typography>
            <Link href={`mailto:${customer.email}`} underline="hover" color="black" sx={{ cursor: 'pointer', fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>
              {customer.email}
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Phone")}:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>{customer.phone}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Points")}:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>{customer.points}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.QRCode")}:
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => onShowQR(customer)}
              title={t("Customers.ShowQR")}
            >
              <QrcodeOutlined />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.CreatedAt")}:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>
              {dayjs(customer.createdAt).format('DD/MM/YYYY hh:mm')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
            <IconButton
              size="small"
              color="success"
              onClick={() => onAddPoints(customer)}
              title={t("Customers.AddPoints")}
            >
              <PlusOutlined />
            </IconButton>
            
            <IconButton
              size="small"
              color="info"
              onClick={() => onViewTransactions(customer.id)}
              title={t("Customers.ViewTransactions")}
            >
              <EyeOutlined />
            </IconButton>
            
            <IconButton
              size="small"
              color="warning"
              onClick={() => onEdit(customer)}
              title={t("Customers.Update")}
            >
              <EditOutlined />
            </IconButton>
            
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onDelete(customer)}
              title={t("Customers.Delete")}
            >
              <DeleteOutlined />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;