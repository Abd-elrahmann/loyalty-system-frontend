import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  Avatar,
  List,
  Tag,
} from 'antd';
import { useMediaQuery } from '@mui/material';
import { 
  TrophyOutlined, 
  UserOutlined, 
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useUser } from '../../utilities/user';

const { Title, Text } = Typography;

const COLORS = ['#800080', '#b300b3', '#e600e6', '#ff33ff'];

const PointsComparisonChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="points" fill="#800080" />
    </BarChart>
  </ResponsiveContainer>
));

const ProductsChart = memo(({ data, nameKey }) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={nameKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar 
        dataKey="count" 
        fill="#800080" 
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
));

const DistributionChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={70}
        dataKey="value"
        labelLine={true}
        label={({ value }) => value > 0 ? `${value}%` : ""}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
      <Legend verticalAlign="bottom" />
    </PieChart>
  </ResponsiveContainer>
));

const DashboardCharts = memo(({ dashboardData }) => {
  const { t, i18n } = useTranslation();
  const user = useUser();
  const isSmallScreen = useMediaQuery('(max-width: 480px)');
  const isMediumScreen = useMediaQuery('(max-width: 768px)');
  const isLargeScreen = useMediaQuery('(min-width: 1200px)');

  const pointsDistributionData = Object.entries(dashboardData.pointsDistribution || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }));

  const pointsComparisonData = [
    { name: t('Dashboard.TotalEarnPoints'), points: dashboardData.totalEarnPoints },
    { name: t('Dashboard.TotalRedeemPoints'), points: dashboardData.totalRedeemPoints }
  ];

  return (
    <Row gutter={[16, 16]} justify={isSmallScreen ? 'center' : isMediumScreen ? 'space-between' : isLargeScreen ? 'space-between' : 'center'}>
      {/* Points Comparison Card */}
      <Col xs={24} lg={12}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Title level={4} style={{ margin: 0 }}>
              {t('Dashboard.PointsComparison')}
            </Title>
            
            <Row gutter={16} style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} justify="center">
              <Col xs={24} sm={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Card size="small" style={{width: isSmallScreen ? '100%' : '200px'}}>
                  <Space direction="vertical" align="center" style={{width: '100%'}}>
                    <Text type="secondary">{t('Dashboard.TotalEarnPoints')}</Text>
                    <Title level={3} style={{margin: 0}}>
                      {typeof dashboardData.totalEarnPoints === 'number' ? dashboardData.totalEarnPoints.toLocaleString() : dashboardData.totalEarnPoints}
                    </Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} style={{display: 'flex', justifyContent: 'center'}}>
                <Card size="small" style={{width: isSmallScreen ? '100%' : '200px'}}>
                  <Space direction="vertical" align="center" style={{width: '100%'}}>
                    <Text type="secondary">{t('Dashboard.TotalRedeemPoints')}</Text>
                    <Title level={3} style={{margin: 0}}>
                      {typeof dashboardData.totalRedeemPoints === 'number' ? dashboardData.totalRedeemPoints.toLocaleString() : dashboardData.totalRedeemPoints}
                    </Title>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <PointsComparisonChart data={pointsComparisonData} />
          </Space>
        </Card>
      </Col>

      {/* Top Earners Card - Only for ADMIN */}
      {user.role === 'ADMIN' && (
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Title level={4} style={{ margin: 0 }}>
                <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                {t('Dashboard.TopEarners')}
              </Title>
              
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.topEarners}
                renderItem={(earner, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: index === 0 ? '#fde3cf' : '#f0f0f0',
                            color: index === 0 ? '#f56a00' : '#000000'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      }
                      title={i18n.language === 'ar' ? earner.arName : earner.enName}
                      description={
                        <Space>
                          <Tag color="purple">
                            {typeof earner.points === 'number' ? earner.points.toLocaleString() : earner.points} {t('Dashboard.Points')}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Col>
      )}

      {/* Most Used Products Card */}
      <Col xs={24} lg={12}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Title level={4} style={{ margin: 0 }}>
              <BarChartOutlined style={{ marginRight: 8 }} />
              {t('Dashboard.MostUsedProducts')}
            </Title>
            <ProductsChart 
              data={dashboardData.mostUsedProducts}
              nameKey={i18n.language === 'ar' ? 'arName' : 'enName'}
            />
          </Space>
        </Card>
      </Col>

      {/* Points Distribution Card */}
      <Col xs={24} lg={12}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Title level={4} style={{ margin: 0 }}>
              <PieChartOutlined style={{ marginRight: 8 }} />
              {t('Dashboard.PointsDistribution')}
            </Title>
            <DistributionChart data={pointsDistributionData} />
          </Space>
        </Card>
      </Col>
    </Row>
  );
});

PointsComparisonChart.displayName = 'PointsComparisonChart';
ProductsChart.displayName = 'ProductsChart';
DistributionChart.displayName = 'DistributionChart';
DashboardCharts.displayName = 'DashboardCharts';

export default DashboardCharts;