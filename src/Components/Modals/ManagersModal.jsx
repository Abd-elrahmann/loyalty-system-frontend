import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { notifyError } from "../../utilities/Toastify";

const ManagersModal = ({ open, onClose, manager, onSave, isLoading }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    enName: "",
    arName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    if (manager) {
      setFormData({
        enName: manager.enName || "",
        arName: manager.arName || "",
        email: manager.email || "",
        phone: manager.phone || "",
        password: manager.password || "",
        role: manager.role || "",
      });
    } else {
      setFormData({
        enName: "",
        arName: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });
    }
    setErrors({});
  }, [manager, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enName.trim())
      newErrors.enName = t("Mangers.Errors.EnglishNameRequired");
    if (!formData.arName.trim())
      newErrors.arName = t("Mangers.Errors.ArabicNameRequired");
    if (!formData.email.trim())
      newErrors.email = t("Mangers.Errors.EmailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t("Mangers.Errors.EmailInvalid");
    if (!formData.phone.trim())
      newErrors.phone = t("Mangers.Errors.PhoneRequired");
    if (!formData.role) newErrors.role = t("Mangers.Errors.RoleRequired");
    if (!formData.password.trim())
      newErrors.password = t("Mangers.Errors.PasswordRequired");
    if (!formData.confirmPassword.trim())
      newErrors.confirmPassword = t("Mangers.Errors.ConfirmPasswordRequired");
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t("Mangers.Errors.PasswordMismatch");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      notifyError(t("Mangers.Errors.generalError"));
      return;
    }

    const submitData = { ...formData };
    if (manager) submitData.id = manager.id;

    try {
      onSave(submitData);
    } catch (error) {
      console.log(error);
      notifyError(t("Mangers.Errors.generalError"));
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="span">
          {manager ? t("Mangers.UpdateManager") : t("Mangers.AddManager")}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label={t("Mangers.EnglishName")}
            value={formData.enName}
            onChange={handleChange("enName")}
            error={!!errors.enName}
            helperText={errors.enName}
            fullWidth
          />

          <TextField
            label={t("Mangers.ArabicName")}
            value={formData.arName}
            onChange={handleChange("arName")}
            error={!!errors.arName}
            helperText={errors.arName}
            fullWidth
            dir="rtl"
          />

          <TextField
            label={t("Mangers.Email")}
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />

          <TextField
            label={t("Mangers.Phone")}
            value={formData.phone}
            onChange={handleChange("phone")}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
          />
             <FormControl fullWidth error={!!errors.role}>
            <InputLabel>{t("Mangers.Role")}</InputLabel>
            <Select
              value={formData.role}
              label={t("Mangers.Role")}
              onChange={handleChange("role")}
            >
              <MenuItem value="ADMIN">
                {i18n.language === "ar" ? "مدير عام" : "ADMIN"}
              </MenuItem>
              <MenuItem value="ACCOUNTANT">
                {i18n.language === "ar" ? "محاسب" : "ACCOUNTANT"}
              </MenuItem>
              <MenuItem value="CASHIER">
                {i18n.language === "ar" ? "كاشير" : "CASHIER"}
              </MenuItem>
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error">
                {errors.role}
              </Typography>
            )}
          </FormControl>

          <TextField
            type={showPassword ? "text" : "password"}
            label={t("Customers.Password")}
            value={formData.password}
            onChange={(e) => handleChange("password")(e)}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleShowPassword}>
                  {showPassword ? (
                    <EyeInvisibleOutlined
                      sx={{ color: "primary.main" }}
                    />
                  ) : (
                    <EyeOutlined sx={{ color: "primary.main" }} />
                  )}
                </IconButton>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined
                    style={{
                      marginRight: "8px",
                      fontSize: "18px",
                      color: "#800080",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            type={showConfirmPassword ? "text" : "password"}
            label={t("Customers.ConfirmPassword")}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword")(e)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleShowConfirmPassword}>
                  {showConfirmPassword ? (
                    <EyeInvisibleOutlined
                      sx={{ color: "primary.main" }}
                    />
                  ) : (
                    <EyeOutlined sx={{ color: "primary.main" }} />
                  )}
                </IconButton>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined
                    style={{
                      marginRight: "8px",
                      fontSize: "18px",
                      color: "#800080",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>
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
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            minWidth: 120,
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          {isLoading
            ? t("Mangers.Saving")
            : manager
            ? t("Mangers.Update")
            : t("Mangers.Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagersModal;
