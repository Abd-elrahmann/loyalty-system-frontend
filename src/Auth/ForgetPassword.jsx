import { useFormik } from 'formik';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const navigate = useNavigate();

  const validate = values => {
    const errors = {};

    if (!values.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]+$/.test(values.phone)) {
      errors.phone = 'Phone number must contain only digits';
    } else if (values.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      phone: ''
    },
    validate,
    onSubmit: (values) => {
      // Handle password reset request here
      console.log('Reset password request for:', values);
    },
  });

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 2, mt: 12 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter your phone number and we'll send you a code to reset your password.
          </Typography>

          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone Number"
            sx={{ mb: 3 }}
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mb: 2 }}
          >
            Send Reset Code
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="span"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 500 }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgetPassword;
