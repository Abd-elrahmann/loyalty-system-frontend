import React, { useState, Suspense, useRef } from 'react';
import { Layout, Card, Row, Col, DatePicker, Space, Spin, Typography, Select, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import Api from '../Config/Api';
import {
  GiftOutlined,
  SwapOutlined,
  UserOutlined,
  BarChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import {Button} from "@mui/material";
import { FilePdfOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { animate } from 'framer-motion';
import { useUser } from '../utilities/user';
import dayjs from 'dayjs';
import Theme from '../utilities/Theme';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  const theme = Theme;
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
        ...(user.role === 'ADMIN' && {
          customersCount: 0,
          avgPoints: 0,
          topEarners: [],
          pointsDistribution: {},
          recentUsers: []
        }),
        ...response.data
      };
    },
    staleTime: 5 * 1000,  // 5 seconds
    cacheTime: 5 * 1000  // 5 seconds
  });

  const exportToPDF = async () => {
    try {
      if (!contentRef.current) return;

      if (filterSectionRef.current) {
        filterSectionRef.current.style.display = 'none';
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#f0f2f5'
      });

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      if (filterSectionRef.current) {
        filterSectionRef.current.style.display = 'block';
      }

      pdf.save('dashboard_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (filterSectionRef.current) {
        filterSectionRef.current.style.display = 'block';
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Skeleton active />
      </div>
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
              {user.role === 'ADMIN' && (
                <Col>
                  <Button
                    variant="outlined"
                    startIcon={<FilePdfOutlined />}
                    onClick={exportToPDF}
                    style={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    {t('Dashboard.DashboardReport')}
                  </Button>
                </Col>
              )}
            </Row>
          </div>

          {user.role === 'ADMIN' && (
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
          )}

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