import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Layout, Card, Row, Col, DatePicker, Button, Space, Spin, Typography, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import Api from '../Config/Api';
import {
  GiftOutlined,
  SwapOutlined,
  UserOutlined,
  BarChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { animate } from 'framer-motion';
import { useUser } from '../utilities/user';
import dayjs from 'dayjs';
import Theme from '../utilities/Theme';
const { Header, Content } = Layout;
const { Title } = Typography;
const PointsChart = lazy(() => import('../Components/Dashboard/PointsChart'));
const DashboardCharts = lazy(() => import('../Components/Dashboard/DashboardCharts'));


const PERIODS = ['day', 'week', 'month', 'year'];

// eslint-disable-next-line no-unused-vars
const StatCard = React.memo(({ icon: Icon, title, value, trend, color = 'primary' }) => {
  const { t } = useTranslation();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = parseInt(value.replace(/,/g, ''));
    const controls = animate(0, numericValue, {
      duration: 2,
      ease: [0.43, 0.13, 0.23, 0.96],
      onUpdate: (latest) => {
        setDisplayValue(Math.floor(latest).toLocaleString());
      }
    });

    return () => controls.stop();
  }, [value]);

  return (
    <Card>
      <Space direction="vertical" size="small">
        <Space>
          <Icon style={{ fontSize: '24px', color: color }} />
          <Typography.Text type="secondary">{title}</Typography.Text>
        </Space>
        <Typography.Title level={3}>{displayValue}</Typography.Title>
        {trend !== undefined && (
          <Typography.Text type={trend >= 0 ? 'success' : 'danger'}>
            {trend >= 0 ? `+${trend}%` : `${trend}%`} {t('Dashboard.fromLastPeriod')}
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
});

const Dashboard = () => {
  const theme = Theme;
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const [dashboardData, setDashboardData] = useState({
    totalPoints: 0,
    transactionsCount: 0,
    totalEarnPoints: 0,
    totalRedeemPoints: 0,
    mostUsedProducts: [],
    ...(user.role === 'ADMIN' && {
      customersCount: 0,
      avgPoints: 0,
      topEarners: [],
      pointsDistribution: {},
      recentUsers: []
    })
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await Api.get('/api/dashboard');
        setLoading(false);
        setDashboardData(dashboardResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedDate, selectedPeriod]);

  const exportToPDF = () => {
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Helmet>
        <title>{t('Dashboard.Dashboard')}</title>
        <meta name="description" content={t('Dashboard.DashboardDescription')} />
      </Helmet>

      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters Section */}
          <Row justify={user.role === 'ADMIN' ? "space-between" : "center"} align="middle" gutter={[16, 16]}>
            <Col>
              <Space wrap>
                <DatePicker
                  color='primary'
                  value={dayjs(selectedDate)}
                  onChange={setSelectedDate}
                  format="DD/MM/YYYY"
                  placeholder={t('Dashboard.SelectDate')}
                />
                <Select
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  style={{ width: 120 }}
                >
                  {PERIODS.map(period => (
                    <Select.Option key={period} value={period}>
                      {t(`Dashboard.${period}`)}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
            </Col>
            {user.role === 'ADMIN' && (
              <Col>
                <Button
                  type="primary"
                  icon={<AreaChartOutlined />}
                  onClick={exportToPDF}
                  style={{backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText}}
                >
                  {t('Dashboard.DashboardReport')}
                </Button>
              </Col>
            )}
          </Row>

          {/* Stats Cards */}
          {user.role === 'ADMIN' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={UserOutlined}
                  title={t('Dashboard.TotalCustomers')}
                  value={dashboardData.customersCount.toLocaleString()}
                  color="#1890ff"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={GiftOutlined}
                  title={t('Dashboard.TotalPoints')}
                  value={dashboardData.totalPoints.toLocaleString()}
                  color="#52c41a"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={BarChartOutlined}
                  title={t('Dashboard.AvgPoints')}
                  value={dashboardData.avgPoints.toLocaleString()}
                  color="#faad14"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={SwapOutlined}
                  title={t('Dashboard.TransactionsCount')}
                  value={dashboardData.transactionsCount.toLocaleString()}
                  color="#13c2c2"
                />
              </Col>
            </Row>
          )}

          {/* Charts Section */}
          <Card>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div>}>
              <DashboardCharts dashboardData={dashboardData} />
            </Suspense>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};

export default Dashboard;