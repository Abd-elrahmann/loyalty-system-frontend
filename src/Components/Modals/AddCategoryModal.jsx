import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, IconButton, Modal } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useFormik } from 'formik';
import { PlusOutlined } from '@ant-design/icons';
import { Spin } from "antd";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const AddCategoryModal = ({ open, onClose, onSubmit, type }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 400px)');

  const formik = useFormik({
    initialValues: {
      enName: "",
      arName: "",
    },
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await onSubmit(values);
        formik.resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formik.values);
      formik.setValues({
        enName: "",
        arName: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{...style, width: isMobile ? '90%' : 600, p: isMobile ? 2 : 4}}>
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
            {type === "cafe"
              ? t("Products.AddCafeCategory")
              : t("Products.AddRestaurantCategory")}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Grid container spacing={isMobile ? 1 : 2} sx={{
            justifyContent: "center",
            mt: isMobile ? 1 : 0,
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
          </Grid>

          <Box
            sx={{
              mt: 3,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button variant="outlined" onClick={onClose} size="small">
              {t("Products.Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formik.values.enName || !formik.values.arName}
              size="small"
            >
              {loading ? (
                <Spin size="small" />
              ) : (
                <>
                  <PlusOutlined style={{marginRight: '4px'}} />
                  {t("Products.AddCategory")}
                </>
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddCategoryModal;
