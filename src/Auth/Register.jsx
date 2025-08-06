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

const Register = () => {
  const navigate = useNavigate();

  const validate = values => {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = 'First name is required';
    } else if (values.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    } else if (values.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]+$/.test(values.phone)) {
      errors.phone = 'Phone number must contain only digits';
    } else if (values.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    },
    validate,
    onSubmit: async (values) => {
      // Handle form submission here
      console.log(values);
    }
  });

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5" color="primary" sx={{ mb: 3 }}>
          Create New Account
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              
              label="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
            
            <TextField
              fullWidth
              
              label="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Box>

          <TextField
            fullWidth
            
            label="Email Address"
            type="email"
            sx={{ mb: 2 }}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            
            label="Phone Number"
            sx={{ mb: 2 }}
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />

          <TextField
            fullWidth
            
            label="Password"
            type="password"
            sx={{ mb: 2 }}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <TextField
            fullWidth
            
            label="Confirm Password"
            type="password"
            sx={{ mb: 3 }}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
          >
            Sign Up
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/login')}
              >
                Login
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;

