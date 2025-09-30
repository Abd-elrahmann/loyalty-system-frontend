import React from "react";
import {
  Box,
  Stack,
  IconButton,
  Chip,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { EditOutlined, DeleteOutlined, SecurityScanOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";
import dayjs from "dayjs";

const ManagersCard = ({ manager, onEdit, onDelete, onPermissions, isLoading }) => {
  const { t, i18n } = useTranslation();

  const getRoleLabel = (role) => {
    if (i18n.language === 'ar') {
      switch(role) {
        case 'ADMIN': return 'مدير عام';
        case 'ACCOUNTANT': return 'محاسب';
        case 'CASHIER': return 'كاشير';
        default: return role;
      }
    }
    return role;
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return '#1677FF';
      case 'ACCOUNTANT': return '#FFA500';
      case 'CASHIER': return '#800080';
      default: return '#4CAF50';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ mb: 2, p: 2 }}>
        <CardContent>
          <Stack spacing={1}>
            {/* ID Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input active size="small" style={{ width: 60, height: 20 }} />
              <Skeleton.Input active size="small" style={{ width: 40, height: 20 }} />
            </Box>
            
            {/* Name Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input active size="small" style={{ width: 100, height: 20 }} />
              <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />
            </Box>
            
            {/* Role Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input active size="small" style={{ width: 60, height: 20 }} />
              <Skeleton.Input active style={{ width: 70, height: 24 }} />
            </Box>
            
            {/* Email Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input active size="small" style={{ width: 60, height: 20 }} />
              <Skeleton.Input active size="small" style={{ width: 120, height: 20 }} />
            </Box>
            
            {/* Phone Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input active size="small" style={{ width: 60, height: 20 }} />
              <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />
            </Box>
            
            {/* Created At Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />
              <Skeleton.Input active size="small" style={{ width: 100, height: 20 }} />
            </Box>
            
            {/* Buttons Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
              <Skeleton.Avatar active size="small" shape="circle" />
              <Skeleton.Avatar active size="small" shape="circle" />
              <Skeleton.Avatar active size="small" shape="circle" />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Mangers.ID")}:
            </Typography>
            <Typography variant="body2">{manager.id}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Mangers.EnglishName")}/{t("Mangers.ArabicName")}:
            </Typography>
            <Typography variant="body2">
              {i18n.language === 'ar' ? manager.arName : manager.enName}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Mangers.Role")}:
            </Typography>
            <Chip
              label={getRoleLabel(manager.role)}
              size="small"
              sx={{
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'white',
                backgroundColor: getRoleColor(manager.role),
                height: '24px'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Mangers.Email")}:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>
              {manager.email}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Mangers.Phone")}:
            </Typography>
            <Typography variant="body2">{manager.phone}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Mangers.CreatedAt")}:
            </Typography>
            <Typography variant="body2">
              {dayjs(manager.createdAt).format('DD/MM/YYYY hh:mm')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onPermissions(manager)}
              title={t("Mangers.Permissions")}
            >
              <SecurityScanOutlined />
            </IconButton>
            
            <IconButton
              size="small"
              color="warning"
              onClick={() => onEdit(manager)}
              title={t("Mangers.Update")}
            >
              <EditOutlined />
            </IconButton>
            
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onDelete(manager)}
              title={t("Mangers.Delete")}
            >
              <DeleteOutlined />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ManagersCard;