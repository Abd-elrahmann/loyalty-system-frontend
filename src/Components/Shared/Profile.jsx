import { useState, useEffect } from 'react';
import React from 'react';
import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Api from '../../Config/Api';
import { notifyError, notifySuccess } from '../../utilities/Toastify';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../utilities/user.jsx';
import { Helmet } from 'react-helmet-async';
import { 
  Layout,
  Typography,
  Card,
  Avatar,
  Button,
  Input,
  Form,
  Space,
  Spin,
  Dropdown,
  Menu,
  Row,
  Col
} from 'antd';
import { 
  DownloadOutlined, 
  DeleteOutlined, 
  EditOutlined,
  CameraOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Password } = Input;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const imageMenu = (
    <Menu>
      <Menu.Item key="upload">
        <label htmlFor="image-upload">
          <Space>
            <EditOutlined style={{color: '#4caf50'}} />
            {profile?.profileImage ? t('Profile.ChangeImage') : t('Profile.UploadImage')}
          </Space>
        </label>
      </Menu.Item>
      <Menu.Item key="remove" onClick={handleRemoveImage}>
        <Space>
          <DeleteOutlined style={{color: '#f44336'}} />
          {t('Profile.RemoveImage')}
        </Space>
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Helmet>
        <title>{t('Profile.Title')}</title>
        <meta name="description" content={t('Profile.ProfileDescription')} />
      </Helmet>
      <Content style={{ padding: '24px', maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto' }}>
        <Card style={{ width: '100%', borderRadius: '8px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={80}
                src={profile?.profileImage}
                style={{ backgroundColor: '#0074BA' }}
              >
                {i18n.language === 'en' ? profile?.enName?.[0] : profile?.arName?.[0]}
              </Avatar>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <Dropdown overlay={imageMenu} placement="bottomRight">
                <Button
                  shape="circle"
                  icon={<CameraOutlined />}
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    backgroundColor: '#0074BA',
                    color: '#fff'
                  }}
                />
              </Dropdown>
            </div>
            <Title level={4} style={{ marginTop: '16px', color: '#0074BA' }}>
              {i18n.language === 'en' ? profile?.enName : profile?.arName}
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title={t('Profile.enName')}>
                <Text>{profile?.enName}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title={t('Profile.arName')}>
                <Text>{profile?.arName}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title={t('Profile.Email')}>
                <Text>{profile?.email}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title={t('Profile.Phone')}>
                <Text>{profile?.phone}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title={t('Profile.Points')}>
                <Text>{profile?.points || 0}</Text>
              </Card>
            </Col>
            <Col xs={24}>
              <Card size="small" title={t('Profile.QRCode')}>
                {profile?.qrCode ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={profile.qrCode}
                      alt="QR Code"
                      style={{
                        width: isMobile ? 150 : 200,
                        height: isMobile ? 150 : 200,
                        objectFit: 'contain'
                      }}
                    />
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadQRCode}
                      style={{ marginTop: '16px', backgroundColor: '#0074BA', color: '#fff' }}
                    />
                  </div>
                ) : (
                  <Text type="secondary">{t('Profile.NoQRCode')}</Text>
                )}
              </Card>
            </Col>
          </Row>

          <Card title={t('Profile.UpdateName')} style={{ marginTop: '24px' }}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('Profile.enName')}>
                    <Input
                      value={nameForm.enName}
                      onChange={(e) => setNameForm({ ...nameForm, enName: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('Profile.arName')}>
                    <Input
                      value={nameForm.arName}
                      onChange={(e) => setNameForm({ ...nameForm, arName: e.target.value })}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Button 
                onClick={handleNameUpdate}
                icon={<EditOutlined />}
                style={{ backgroundColor: '#0074BA', color: '#fff' }}
              >
                {t('Profile.Update')}
              </Button>
            </Form>
          </Card>

          <Card title={t('Profile.UpdatePassword')} style={{ marginTop: '24px' }}>
            <Form layout="vertical">
              <Form.Item label={t('Profile.oldPassword')}>
                <Password
                  style={{width: isMobile ? '100%' : '49%'}}
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('Profile.newPassword')}>
                    <Password
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('Profile.confirmPassword')}>
                    <Password
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Button 
                onClick={handlePasswordUpdate}
                icon={<EditOutlined />}
                style={{ backgroundColor: '#0074BA', color: '#fff' }}
              >
                {t('Profile.Update')}
              </Button>
            </Form>
          </Card>
        </Card>
      </Content>
    </Layout>
  );
};

export default Profile;
