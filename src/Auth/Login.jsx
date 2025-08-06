import { useFormik } from 'formik';
import { 
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
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

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      phone: '',
      password: ''
    },
    validate,
    onSubmit: (values) => {
      // Handle login submission here
      console.log('Login values:', values);
    },
  });

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 2 ,mt: 12}}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography 
            component="h1" 
            variant="h4" 
            align="center" 
            color="primary"
            sx={{ mb: 4, fontWeight: 600 }}
          >
            Login
          </Typography>

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

          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              sx={{ textDecoration: 'none' }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
          >
            Login
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
