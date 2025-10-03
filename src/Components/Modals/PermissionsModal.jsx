import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Api from "../../Config/Api";
import routes from "../../Config/routes";
import { notifyError, notifySuccess } from "../../utilities/Toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { triggerPermissionsUpdate } from "../../hooks/usePermissionsSync";
import {Spin} from 'antd'
import { updateUserPermissions } from "../../utilities/user.jsx";
const PermissionsModal = ({ open, onClose, manager }) => {
  const { t, i18n } = useTranslation();
  const [selectedPages, setSelectedPages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  const availablePages = routes.map(route => {
    let pageName = route.path.replace('/', '').toLowerCase();
    
    if (pageName === 'managers') pageName = 'users';
    if (pageName === 'point-of-sale') pageName = 'pos';
    if (pageName === 'invoice') pageName = 'invoices';
    if (pageName === 'customers') pageName = 'customers';
    if (pageName === 'logs') pageName = 'logs';
    return pageName;
  });

  const { data: currentPermissions, isLoading } = useQuery({
    queryKey: ['permissions', manager?.role],
    queryFn: async () => {
      if (!manager?.role) return [];
      const response = await Api.get(`/api/roles/${manager.role}`);
      return response.data;
    },
    enabled: !!manager?.role && open,
  });

  useEffect(() => {
    if (manager?.role === 'ADMIN') {
      setSelectedPages([...availablePages]);
    } else if (currentPermissions && Array.isArray(currentPermissions)) {
      const pages = currentPermissions.map(perm => perm.page);
      setSelectedPages(pages);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPermissions, manager?.role]);

  const updatePermissionsMutation = useMutation({
    mutationFn: async (pages) => {
      setIsSaving(true);
      const response = await Api.patch(`/api/roles/${manager.role}`, { pages });
      return response.data;
    },
    onSuccess: () => {
      notifySuccess(t("Mangers.PermissionsUpdated"));

      updateUserPermissions(manager.role);
      triggerPermissionsUpdate(manager.role);
      queryClient.invalidateQueries({ queryKey: ['permissions', manager.role] });
      
      setIsSaving(false);
      onClose();
    },
    onError: (error) => {
      setIsSaving(false);
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const handleTogglePage = (page) => {
    setSelectedPages(prev =>
      prev.includes(page)
        ? prev.filter(p => p !== page)
        : [...prev, page]
    );
  };

  const handleSelectAll = () => {
    if (selectedPages.length === availablePages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages([...availablePages]);
    }
  };

  const handleSavePermissions = () => {
    if (!manager?.role) return;
    updatePermissionsMutation.mutate(selectedPages);
  };

  const getPageLabel = (page) => {
    let routePath = `/${page}`;
    if (page === 'users') routePath = '/managers';
    if (page === 'pos') routePath = '/point-of-sale';
    if (page === 'customers') routePath = '/customers';
    if (page === 'invoices') routePath = '/invoice';
    if (page === 'logs') routePath = '/logs';
    const route = routes.find(r => r.path === routePath);
    
    if (route) {
      return i18n.language === 'ar' ? route.arName : route.name;
    }

    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  if (!manager) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" component="div">
            {t("Mangers.ManagerPermissions")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {i18n.language === 'ar' ? manager.arName : manager.enName} - {manager.role}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Spin size="large" />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleSelectAll}
              >
                {selectedPages.length === availablePages.length 
                  ? t("Mangers.DeselectAll") 
                  : t("Mangers.SelectAll")
                }
              </Button>
              
              <Chip 
                label={`${selectedPages.length} / ${availablePages.length} ${t("Mangers.PagesSelected")}`}
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
              {availablePages.map((page) => (
                <FormControlLabel
                  key={page}
                  control={
                    <Checkbox
                      checked={selectedPages.includes(page)}
                      onChange={() => handleTogglePage(page)}
                    />
                  }
                  label={getPageLabel(page)}
                />
              ))}
            </FormGroup>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            minWidth: 120,
          }}
        >
          {t("Mangers.Cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSavePermissions}
          disabled={isSaving || isLoading}
          sx={{
            minWidth: 120,
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          {isSaving ? (
            <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
          ) : null}
          {t("Mangers.SavePermissions")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionsModal;