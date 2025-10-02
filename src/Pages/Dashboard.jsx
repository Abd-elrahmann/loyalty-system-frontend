import React, { useState, Suspense, useRef } from 'react';
import { Layout, Card, Row, Col, DatePicker, Space, Typography, Select, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import Api from '../Config/Api';
import {
  GiftOutlined,
  SwapOutlined,
  UserOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { animate } from 'framer-motion';
import { useUser } from '../utilities/user';
import dayjs from 'dayjs';
const { Content } = Layout;
import DashboardCharts from '../Components/Dashboard/DashboardCharts';
import { useQuery } from '@tanstack/react-query';

const PERIODS = ['day', 'week', 'month', 'year'];

// eslint-disable-next-line no-unused-vars
const StatCard = React.memo(({ icon: Icon, title, value, trend, color = 'primary' }) => {
  const { t } = useTranslation();
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    const numericValue = parseInt(value);
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
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const user = useUser();
  const contentRef = useRef(null);
  const filterSectionRef = useRef(null);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', selectedDate.format('YYYY-MM-DD'), selectedPeriod],
    queryFn: async () => {
      const response = await Api.get('/api/dashboard');
      
      const analyticsResponse = await Api.get(`/api/dashboard/analytics?period=${selectedPeriod}&date=${selectedDate.format('YYYY-MM-DD')}`);
      
      return {
        totalPoints: 0,
        transactionsCount: analyticsResponse.data.transactions.count,
        totalEarnPoints: analyticsResponse.data.earn.totalPoints,
        totalRedeemPoints: analyticsResponse.data.redeem.totalPoints,
        mostUsedProducts: [],
        period: analyticsResponse.data.period,
        from: analyticsResponse.data.from,
        to: analyticsResponse.data.to,
        ...(user.role !== 'USER' && {
          customersCount: 0,
          avgPoints: 0,
          topEarners: [],
          pointsDistribution: {},
          recentUsers: []
        }),
        ...response.data
      };
    },
    staleTime: 5 * 1000,
    cacheTime: 5 * 1000
  });


  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Filter Section Skeleton */}
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col>
                <Space wrap>
                  <Skeleton.Input active style={{ width: 120 }} />
                  <Skeleton.Input active style={{ width: 120 }} />
                </Space>
              </Col>
              <Col>
                <Skeleton.Button active style={{ width: 150 }} />
              </Col>
            </Row>

            {/* Stats Cards Skeleton */}
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map(key => (
                <Col xs={24} sm={12} lg={6} key={key}>
                  <Card>
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Charts Skeleton */}
            <Card>
              <Skeleton.Input active block style={{ height: 400 }} />
            </Card>
          </Space>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Helmet>
        <title>{t('Dashboard.Dashboard')}</title>
        <meta name="description" content={t('Dashboard.DashboardDescription')} />
      </Helmet>

      <Content style={{ padding: '24px' }} ref={contentRef}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div ref={filterSectionRef}>
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
            </Row>
          </div>

          {user.role !== 'USER' ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={UserOutlined}
                  title={t('Dashboard.TotalCustomers')}
                  value={dashboardData.customersCount}
                  color="#1890ff"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={GiftOutlined}
                  title={t('Dashboard.TotalPoints')}
                  value={dashboardData.totalPoints}
                  color="#52c41a"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={BarChartOutlined}
                  title={t('Dashboard.AvgPoints')}
                  value={dashboardData.avgPoints}
                  color="#faad14"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <StatCard
                  icon={SwapOutlined}
                  title={t('Dashboard.TransactionsCount')}
                  value={dashboardData.transactionsCount}
                  color="#13c2c2"
                />
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <StatCard
                  icon={GiftOutlined}
                  title={t('Dashboard.YourPoints')}
                  value={dashboardData.totalPoints}
                  color="#52c41a"
                />
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <StatCard
                  icon={SwapOutlined}
                  title={t('Dashboard.YourTransactions')}
                  value={dashboardData.transactionsCount}
                  color="#13c2c2"
                />
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <StatCard
                  icon={BarChartOutlined}
                  title={t('Dashboard.EarnedPoints')}
                  value={dashboardData.totalEarnPoints}
                  color="#faad14"
                />
              </Col>
            </Row>
          )}

          <Card>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}><Skeleton active /></div>}>
              <DashboardCharts dashboardData={dashboardData} />
            </Suspense>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};

export default Dashboard;