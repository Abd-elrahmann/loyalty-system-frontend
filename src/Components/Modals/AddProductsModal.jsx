import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid, IconButton, Modal, InputAdornment, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useFormik } from 'formik';
import { Spin } from "antd";
import { FaCoins,FaProductHunt, FaLink, FaFile, FaDollarSign, FaList } from 'react-icons/fa';
import { TbCurrencyDinar } from 'react-icons/tb';
import { useSettings } from '../../hooks/useSettings';

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

const AddProductModal = ({ open, onClose, onSubmit, type, handleUpdateProduct, productToEdit, fetchProducts, categories, onOpenCategoryModal }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUploadType, setImageUploadType] = useState('file');
  const isMobile = useMediaQuery('(max-width: 400px)');
  const fileInputRef = useRef(null);
  
  // Get settings for currency conversion
  const { data: settings } = useSettings();

  // Function to format price based on currency settings
  const formatPrice = (price) => {
    if (!settings || !price) return price;
    
    if (settings.enCurrency === 'USD') {
      return `$${price}`;
    } else if (settings.enCurrency === 'IQD') {
      const convertedPrice = (price * settings.usdToIqd).toLocaleString();
      return `${convertedPrice} ${i18n.language === 'ar' ? settings.arCurrency : settings.enCurrency}`;
    }
    return price;
  };

  const formik = useFormik({
    initialValues: {
      image: null,
      imagePreview: "",
      imageUrl: "",
      enName: "",
      arName: "",
      price: "",
      points: "",
      categoryId: "",
    },
    onSubmit: async (values) => {
      try {
        const submitData = {
          ...values,
          image: values.imageUrl || values.imagePreview,
          points: values.points
        };
        if (handleUpdateProduct) {
          await handleUpdateProduct(submitData);
        } else {
          await onSubmit(submitData);
          fetchProducts();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (productToEdit) {
        formik.setValues({
          ...productToEdit,
          image: productToEdit.image,
          imagePreview: productToEdit.image,
          imageUrl: productToEdit.image,
          categoryId: productToEdit.categoryId || "",
        });
      } else {
        formik.resetForm();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productToEdit, open]);

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
          imageUrl: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [imageError, setImageError] = useState(false);
  
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const handleImageUrlChange = async (url) => {
    if (!url) {
      setImageError(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      await preloadImage(url);
      setImageError(false);
    } catch (error) {
      console.error('Error loading image:', error);
      setImageError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formik.values,
        image: formik.values.imageUrl || formik.values.imagePreview,
        points: formik.values.points
      };
      if (handleUpdateProduct && productToEdit) {
        await handleUpdateProduct(submitData);
      } else {
        await onSubmit(submitData);
      }
      formik.setValues({
        image: null,
        imagePreview: "",
        imageUrl: "",
        enName: "",
        arName: "",
        price: "",
        points: "",
        categoryId: "",
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
        <Box sx={{...style, width: isMobile ? '90%' : 600, p: isMobile ? 1 : 4}}>
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
          {(!categories || categories.length === 0) && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    onClose();
                    onOpenCategoryModal();
                  }}
                >
                  {t("Products.AddCategory")}
                </Button>
              }
            >
              {t("Products.NoCategoriesAlert")}
            </Alert>
          )}
          
          <Grid container spacing={isMobile ? 1 : 2} sx={{
            justifyContent: isMobile ? "center" : "flex-start",
            mt: isMobile ? 3 : 0,
          }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("Products.EnglishName")}
                name="enName"
                value={formik.values.enName}
                onChange={handleChange}
                required
                disabled={!categories || categories.length === 0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaProductHunt style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  )
                }}
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
                disabled={!categories || categories.length === 0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaProductHunt style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: '245px' }}>
                <InputLabel>{t("Products.Category")}</InputLabel>
                <Select
                  name="categoryId"
                  value={formik.values.categoryId}
                  label={t("Products.Category")}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={!categories || categories.length === 0}
                  startAdornment={
                    <InputAdornment position="start">
                      <FaList style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  }
                >
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {i18n.language === 'ar' ? category.arName : category.enName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      {t('Products.NoCategories')}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("Products.Price") + (settings?.enCurrency === 'USD' ? ' (USD)' : ' (IQD)')}
                name="price"
                type="number"
                value={formik.values.price}
                onChange={handleChange}
                required
                disabled={!categories || categories.length === 0}
                helperText={formik.values.price && settings?.enCurrency === 'IQD' ? 
                  `${t('Products.ConvertedPrice')}: ${formatPrice(formik.values.price)}` : 
                  ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaDollarSign style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  )
                }}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaCoins style={{marginRight: '8px', fontSize: '18px', color: '#800080'}} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%',
                gap: 2
              }}>
                <Button
                  variant={imageUploadType === 'file' ? 'contained' : 'outlined'}
                  onClick={() => setImageUploadType('file')}
                  sx={{ 
                    flex: 1,
                    maxWidth: '200px'
                  }}
                >
                  <FaFile style={{marginRight: '8px', fontSize: '18px', color: imageUploadType === 'file' ? 'white' : '#800080'}} />
                  {t("Products.ImageUploadTypeFile")}
                </Button>
                <Button
                  variant={imageUploadType === 'link' ? 'contained' : 'outlined'}
                  onClick={() => setImageUploadType('link')}
                  sx={{
                    flex: 1, 
                    maxWidth: '200px'
                  }}
                >
                  <FaLink style={{marginRight: '8px', fontSize: '18px', color: imageUploadType === 'link' ? 'white' : '#800080'}} />
                  {t("Products.ImageUploadTypeLink")}
                </Button>
              </Box>

              <Box sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {imageUploadType === 'link' ? (
                  <TextField
                    fullWidth
                    label={t("Products.ImageUploadType")}
                    name="imageUrl"
                    value={formik.values.imageUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      formik.setFieldValue('imageUrl', url);
                      formik.setFieldValue('imagePreview', '');
                      if (url) {
                        handleImageUrlChange(url);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    sx={{ mb: 2, maxWidth: '400px' }}
                    error={imageError}
                    helperText={imageError ? t("Products.InvalidImageUrl") : ""}
                  />
                ) : (
                  <Box
                    sx={{
                      border: "2px dashed",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      maxWidth: '400px',
                      width: '100%',
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
                )}
              </Box>

              {imageUploadType === 'link' && formik.values.imageUrl && (
                <Box sx={{ 
                  mt: 2, 
                  textAlign: 'center', 
                  position: 'relative',
                  maxWidth: '400px',
                  width: '100%'
                }}>
                  {!imageError ? (
                    <img
                      src={formik.values.imageUrl}
                      alt="Product Preview"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                      loading="lazy"
                      crossOrigin="anonymous"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "200px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px dashed",
                        borderColor: "error.main",
                        borderRadius: "8px",
                        bgcolor: "error.light",
                      }}
                    >
                      <Typography color="error">
                        {t("Products.ImageLoadError")}
                      </Typography>
                    </Box>
                  )}
                  {formik.values.imageUrl && !imageError && (
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
                      onClick={() => {
                        formik.setValues((prev) => ({
                          ...prev,
                          imageUrl: "",
                        }));
                        setImageError(false);
                      }}
                    >
                      <CloseIcon sx={{ color: "white", fontSize: "16px" }} />
                    </Box>
                  )}
                </Box>
              )}
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
            <Button variant="outlined" onClick={onClose} sx={{ mr: 2 }} size="small">
              {t("Products.Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !categories || categories.length === 0 || !formik.values.enName || !formik.values.arName || !formik.values.price || !formik.values.categoryId || (!formik.values.imagePreview && !formik.values.imageUrl)}
              size="small"
            >
              {loading ? (
                <Spin size="large" />
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