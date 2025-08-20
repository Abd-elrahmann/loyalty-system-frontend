import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, useTheme, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Api from '../Config/Api';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  People as PeopleIcon,
  CardGiftcard as PointsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import Grid from '@mui/material/Grid';

const COLORS = ['#800080', '#b300b3', '#e600e6', '#ff33ff'];

const StatCard = ({ icon: Icon, title, value, trend, color = 'primary' }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  };

  return (
    <Box sx={{
      p: 3,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ color: colorMap[color], mr: 1 }} />
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      {trend !== undefined && (
        <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}>
          {trend >= 0 ? `+${trend}%` : `${trend}%`} {t('Dashboard.fromLastPeriod')}
        </Typography>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('year');
  const [dashboardData, setDashboardData] = useState({
    customersCount: 0,
    totalPoints: 0,
    avgPoints: 0,
    totalEarnPoints: 0,
    totalRedeemPoints: 0,
    pointsDistribution: {},
    mostUsedProducts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await Api.get('/api/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const pointsDistributionData = Object.entries(dashboardData.pointsDistribution || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Stats Cards Row */}
        <Grid container spacing={7} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PeopleIcon}
              title={t('Dashboard.TotalCustomers')}
              value={dashboardData.customersCount.toLocaleString()}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PointsIcon}
              title={t('Dashboard.TotalPoints')}
              value={dashboardData.totalPoints.toLocaleString()}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUpIcon}
              title={t('Dashboard.AveragePoints')}
              value={dashboardData.avgPoints.toLocaleString()}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Most Used Products Bar Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>{t('Dashboard.mostUsedProducts')}</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dashboardData.mostUsedProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="enName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name={t('Dashboard.Transactions')} 
                fill="#800080" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Points Distribution Pie Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>{t('Dashboard.PointsDistribution')}</Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.TotalEarned')}
              </Typography>
              <Typography variant="h5">{dashboardData.totalEarnPoints}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.TotalRedeemed')}
              </Typography>
              <Typography variant="h5">{dashboardData.totalRedeemPoints}</Typography>
            </Grid>
          </Grid>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pointsDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#800080"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pointsDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Stack>
    </Box>
  );
};

export default Dashboard;