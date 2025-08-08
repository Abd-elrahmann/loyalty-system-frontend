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
import { useState } from 'react';
import Spinner from '../utilities/Spinner';
import { notifyError, notifySuccess } from '../utilities/Toastify';
import Api from '../Config/Api';
import Navbar from '../Components/Shared/Navbar';
import { useTranslation } from 'react-i18next';


const Login = () => {
  const {t} =useTranslation()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const validate = values => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validate,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await Api.post('/api/auth/login', values);
        
        // Store token and user data in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        notifySuccess('Login successful');
        navigate('/dashboard');
      } catch (error) {
        notifyError(error.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Navbar />
    <Container component="main" maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 ,mt: 12}}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            color="primary"
            sx={{ mb: 4, fontWeight: 600 }}
          >
            {t('Login.login')}
          </Typography>

          <TextField
            fullWidth
            name="email"
            label={t('Login.email')}
            sx={{ mb: 2 }}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            name="password"
            label={t('Login.password')}
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
              {t('Login.forgotPassword')}
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
          >
            {loading ? <Spinner /> : t('Login.login')}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('Login.dontHaveAccount')}{' '}
              <Typography
                component="span"
                color="primary"
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/signup')}
              >
                {t('Login.signUp')}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
    </>
  );
};

export default Login;
