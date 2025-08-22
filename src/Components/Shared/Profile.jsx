import { useState, useEffect } from 'react';
import React from 'react';
  const Box = React.lazy(() => import('@mui/material/Box'));
  const Typography = React.lazy(() => import('@mui/material/Typography'));
  const Paper = React.lazy(() => import('@mui/material/Paper'));
  const Container = React.lazy(() => import('@mui/material/Container'));
  const Avatar = React.lazy(() => import('@mui/material/Avatar'));
  const CircularProgress = React.lazy(() => import('@mui/material/CircularProgress'));
  const Grid = React.lazy(() => import('@mui/material/Grid'));
  const TextField = React.lazy(() => import('@mui/material/TextField'));
  const Button = React.lazy(() => import('@mui/material/Button'));
  const IconButton = React.lazy(() => import('@mui/material/IconButton'));
  const Menu = React.lazy(() => import('@mui/material/Menu'));
  const MenuItem = React.lazy(() => import('@mui/material/MenuItem'));
  import { useMediaQuery } from '@mui/material';

import { useTranslation } from 'react-i18next';
import Api from '../../Config/Api';
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../utilities/user.jsx';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { Helmet } from 'react-helmet-async';
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageMenuAnchorEl, setImageMenuAnchorEl] = useState(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 400px)');

  const [nameForm, setNameForm] = useState({ enName: '', arName: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await Api.get('/api/auth/profile');
        setProfile(response.data);
        setNameForm({
          enName: response.data.enName,
          arName: response.data.arName
        });
        localStorage.setItem('profile', JSON.stringify(response.data));
        updateUserProfile(); 
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        setError(err.response?.data?.message || 'Error fetching profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleNameUpdate = async () => {
    try {
      await Api.put('/api/auth/update-name', nameForm);
      const updatedProfile = { ...profile, ...nameForm };
      setProfile(updatedProfile);
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      updateUserProfile(); 
      notifySuccess(t('Profile.NameUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating name');
      notifyError(err.response?.data?.message || 'Error updating name');
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await Api.put('/api/auth/update-password', passwordForm);
      notifySuccess(t('Profile.PasswordUpdated'));
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
      notifyError(err.response?.data?.message || 'Error updating password');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await Api.patch('/api/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedProfile = {...profile, profileImage: response.data.user.profileImage};
      setProfile(updatedProfile);
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      updateUserProfile();
      notifySuccess(t('Profile.ImageUploaded'));
      setImageMenuAnchorEl(null);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Error uploading image');
    }
  };

  const handleRemoveImage = async () => {
    try {
      await Api.delete('/api/auth/profile/image');
      const updatedProfile = {...profile, profileImage: null};
      setProfile(updatedProfile);
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      updateUserProfile();
      notifySuccess(t('Profile.ImageRemoved'));
      setImageMenuAnchorEl(null);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Error removing image');
    }
  };

  const handleDownloadQRCode = async () => {
    try {
      const qrCode = profile.qrCode;
      if (!qrCode) {
        notifyError(t('Profile.NoQRCode'));
        return;
      }

      const response = await fetch(qrCode);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${profile.email}.png`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      notifyError(err.message || t('Errors.generalError')); 
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth={isMobile ? "xs" : "md"} 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        minHeight: 'calc(100vh - 128px)', 
        py: 4
      }}
    >
      <Helmet>
        <title>{t('Profile.Title')}</title>
        <meta name="description" content={t('Profile.ProfileDescription')} />
      </Helmet>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile?.profileImage}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {i18n.language === 'en' ? profile?.enName?.[0] : profile?.arName?.[0]}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-button-file"
              type="file"
              onChange={handleImageUpload}
            />
            <IconButton 
              onClick={(e) => setImageMenuAnchorEl(e.currentTarget)}
              sx={{
                position: 'absolute',
                bottom: -10,
                right: -10,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              <PhotoCamera />
            </IconButton>
            <Menu
              anchorEl={imageMenuAnchorEl}
              open={Boolean(imageMenuAnchorEl)}
              onClose={() => setImageMenuAnchorEl(null)}
            >
              <label htmlFor="icon-button-file">
                <MenuItem component="span">
                  <ChangeCircleIcon color='primary' sx={{ mr: 1 }} />
              {profile?.profileImage ? t('Profile.ChangeImage') : t('Profile.UploadImage')}
                </MenuItem>
              </label>
              <MenuItem onClick={handleRemoveImage}>
                <DeleteIcon color='error' sx={{ mr: 1 }} />
                {t('Profile.RemoveImage')}
              </MenuItem>
            </Menu>
          </Box>

          <Typography variant="h5" component="h1" gutterBottom>
            {i18n.language === 'en' ? profile?.enName : profile?.arName}
          </Typography>

          <Box sx={{ mt: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {/* Names Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Paper elevation={1} sx={{ p: 2, width: '250px' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('Profile.enName')}
                  </Typography>
                  <Typography variant="body1">{profile?.enName}</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 2, width: '250px' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('Profile.arName')}
                  </Typography>
                  <Typography variant="body1">{profile?.arName}</Typography>
                </Paper>
              </Box>

              {/* Contact Info Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Paper elevation={1} sx={{ p: 2, maxWidth: '400px' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('Profile.Email')}
                  </Typography>
                  <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</Typography>
                </Paper>
                <Paper elevation={2} sx={{ p: 2, width: '250px' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('Profile.Phone')}
                  </Typography>
                  <Typography variant="body1">{profile?.phone}</Typography>
                </Paper>
              </Box>

              {/* Points Row */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper elevation={1} sx={{ p: 2, width: '250px', height: 'fit-content' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('Profile.Points')}
                  </Typography>
                  <Typography variant="body1">{profile?.points || 0}</Typography>
                </Paper>
              </Box>

              {/* QR Code Row */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper elevation={1} sx={{ p: 2, width: '300px', height: 'fit-content' }}>
                  <Typography variant="subtitle1" color="text.secondary" align="center">
                    {t('Profile.QRCode')}
                  </Typography>
                  {profile?.qrCode ? (
                    <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Box
                        component="img"
                        src={profile.qrCode}
                        alt="QR Code"
                        sx={{
                          width: isMobile ? 150 : 200,
                          height: isMobile ? 150 : 200,
                          objectFit: 'contain',
                          borderRadius: 1,
                          border: '1px solid #eee'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Button  color="primary" onClick={handleDownloadQRCode} sx={{ mt: 2 }}>
                        <DownloadIcon sx={{ fontSize: '25px' }} />
                      </Button>
                    </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      {t('Profile.NoQRCode')}
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 4, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{mb: 2}}>
              {t('Profile.UpdateName')}
            </Typography>
            <Grid container spacing={2}>
              <Grid  xs={12} sm={6} sx={{ mx: isMobile ? 'auto' : 0 }}>
                <TextField
                  fullWidth
                  label={t('Profile.enName')}
                  value={nameForm.enName}
                  onChange={(e) => setNameForm({ ...nameForm, enName: e.target.value })}
                />
              </Grid>
              <Grid  xs={12} sm={6} sx={{ mx: isMobile ? 'auto' : 0 }}>
                <TextField
                  fullWidth
                  label={t('Profile.arName')}
                  value={nameForm.arName}
                  onChange={(e) => setNameForm({ ...nameForm, arName: e.target.value })}
                />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleNameUpdate}>
              {t('Profile.Update')}
            </Button>
          </Box>
                
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{mb: 2}}>
              {t('Profile.UpdatePassword')}
            </Typography>
            <Grid container spacing={2}>
              <Grid  xs={12} sx={{ mx: isMobile ? 'auto' : 0 }}>
                <TextField
                  fullWidth
                  type="password"
                  label={t('Profile.oldPassword')}
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                />
              </Grid>
              <Grid  xs={12} sm={6} sx={{ mx: isMobile ? 'auto' : 0 }}>
                <TextField
                  fullWidth
                  type="password"
                  label={t('Profile.newPassword')}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
              </Grid>
              <Grid  xs={12} sm={6} sx={{ mx: isMobile ? 'auto' : 0 }} >
                <TextField
                  fullWidth
                  type="password"
                  label={t('Profile.confirmPassword')}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handlePasswordUpdate}>
              {t('Profile.Update')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
