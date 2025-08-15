import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useFormik } from 'formik';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const AddProductModal = ({ open, onClose, onSubmit, type, handleUpdateProduct, productToEdit }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 400px)');
  const fileInputRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      image: null,
      imagePreview: "",
      enName: "",
      arName: "",
      price: "",
      points: "",
    },
    onSubmit: async (values) => {
      try {
        const submitData = {
          ...values,
          image: values.imagePreview,
        };
        if (handleUpdateProduct) {
          await handleUpdateProduct(submitData);
        } else {
          await onSubmit(submitData);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
  });


  useEffect(() => {

    if (productToEdit) {
      formik.setValues({
        ...productToEdit,
        image: productToEdit.image,
        imagePreview: productToEdit.image,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setValues((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formik.values,
        image: formik.values.imagePreview, 
      };
      if (handleUpdateProduct) {
        await handleUpdateProduct(submitData);
      } else {
        await onSubmit(submitData);
      }
      formik.setValues({
        image: null,
        imagePreview: "",
        enName: "",
        arName: "",
        price: "",
        points: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
        <Box sx={{...style, width: isMobile ? '90%' : 600,p:isMobile ? 1 : 4}}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {productToEdit ? t("Products.EditProduct") : type === "cafe"
              ? t("Products.AddCafeProduct")
              : t("Products.AddRestaurantProduct")}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Grid container spacing={isMobile ? 1 : 2} sx={{
            justifyContent: isMobile ? "center" : "flex-start",
            mt:isMobile ? 3 : 0,
          }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("Products.EnglishName")}
                name="enName"
                value={formik.values.enName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("Products.ArabicName")}
                name="arName"
                value={formik.values.arName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("Products.Points")}
                name="points"
                type="number"
                value={formik.values.points}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "primary.main",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
                onClick={triggerFileInput}
              >
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="product-image-upload"
                  ref={fileInputRef}
                />
                {formik.values.imagePreview ? (
                  <Box sx={{ position: "relative" }}>
                    <img
                      src={formik.values.imagePreview}
                      alt="Product Preview"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.7)",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        formik.setValues((prev) => ({
                          ...prev,
                          image: null,
                          imagePreview: "",
                        }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <CloseIcon sx={{ color: "white", fontSize: "16px" }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: "block", color: "text.secondary" }}
                    >
                      {t("Products.ClickToChange")}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 3 }}>
                    <CloudUploadIcon
                      sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {t("Products.DragAndDrop")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("Products.SupportedFormats")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 3,
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="outlined" onClick={onClose} sx={{ mr: 2 }}>
              {t("Products.Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formik.values.image || !formik.values.enName || !formik.values.arName || !formik.values.price || !formik.values.points}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                productToEdit ? t("Products.UpdateProduct") : t("Products.AddProduct")
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddProductModal;
