import React, { useState } from 'react';
import { Box, Stack, Typography, useTheme, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  People as PeopleIcon,
  CardGiftcard as PointsIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import Grid from '@mui/material/Grid';

// Mock data
const mockStats = {
  totalCustomers: 1250,
  totalPoints: 156789,
  averagePoints: 1250,
  topCustomers: 5,
  storesCount: 18,
  itemsCount: 2450
};

const mockItemTransactions = [
  { name: 'Product A', count: 430 },
  { name: 'Product B', count: 380 },
  { name: 'Product C', count: 290 },
  { name: 'Product D', count: 210 },
  { name: 'Product E', count: 180 }
];

const mockStoreTransactions = [
  { storeName: 'Main Store', fromCount: 120, toCount: 85, totalCount: 205 },
  { storeName: 'Downtown', fromCount: 95, toCount: 110, totalCount: 205 },
  { storeName: 'Mall Branch', fromCount: 75, toCount: 60, totalCount: 135 },
  { storeName: 'Airport', fromCount: 50, toCount: 40, totalCount: 90 }
];

const mockPointsDistribution = [
  { name: '0-1000', value: 35 },
  { name: '1001-5000', value: 45 },
  { name: '5001-10000', value: 15 },
  { name: '10000+', value: 5 }
];

const mockRevenueData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5000, expenses: 2800 },
  { month: 'Apr', revenue: 2780, expenses: 1908 },
  { month: 'May', revenue: 6890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 1800 }
];

const COLORS = ['#800080', '#b300b3', '#e600e6', '#ff33ff'];

// eslint-disable-next-line no-unused-vars
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
      <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}>
        {trend >= 0 ? `+${trend}%` : `${trend}%`} {t('Dashboard.fromLastPeriod')}
      </Typography>
    </Box>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('year');

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Stats Cards Row */}
        <Grid container spacing={7} sx={{ width: '100%',display: 'flex', justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PeopleIcon}
              title={t('Dashboard.TotalCustomers')}
              value={mockStats.totalCustomers.toLocaleString()}
              trend={12}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PointsIcon}
              title={t('Dashboard.TotalPoints')}
              value={mockStats.totalPoints.toLocaleString()}
              trend={8}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUpIcon}
              title={t('Dashboard.AveragePoints')}
              value={mockStats.averagePoints.toLocaleString()}
              trend={5}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={StoreIcon}
              title={t('Dashboard.Stores')}
              value={mockStats.storesCount.toLocaleString()}
              trend={3}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Item Transactions Bar Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">{t('Dashboard.ItemTransactions')}</Typography>
            <Box>
              {['week', 'month', 'year'].map((value) => (
                <Button
                  key={value}
                  variant={value === period ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setPeriod(value)}
                  sx={{ ml: 1 }}
                >
                  {t(`Dashboard.${value}`)}
                </Button>
              ))}
            </Box>
          </Stack>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockItemTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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

        {/* Store Transactions Dual Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">{t('Dashboard.StoreTransactions')}</Typography>
            <Box>
              {['week', 'month', 'year'].map((value) => (
                <Button
                  key={value}
                  variant={value === period ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setPeriod(value)}
                  sx={{ ml: 1 }}
                >
                  {t(`Dashboard.${value}`)}
                </Button>
              ))}
            </Box>
          </Stack>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.TotalIn')}
              </Typography>
              <Typography variant="h5">320</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.TotalOut')}
              </Typography>
              <Typography variant="h5">295</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.Stores')}
              </Typography>
              <Typography variant="h5">{mockStats.storesCount}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.Items')}
              </Typography>
              <Typography variant="h5">{mockStats.itemsCount}</Typography>
            </Grid>
          </Grid>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockStoreTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="storeName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="fromCount" 
                name={t('Dashboard.Incoming')} 
                fill="#800080" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="toCount" 
                name={t('Dashboard.Outgoing')} 
                fill="#b300b3" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Revenue & Expenses Line Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>{t('Dashboard.Revenue&Expenses')}</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name={t('Dashboard.Revenue')}
                stroke="#800080"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name={t('Dashboard.Expenses')}
                stroke="#ff33ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Points Distribution Pie Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>{t('Dashboard.PointsDistribution')}</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={mockPointsDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#800080"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {mockPointsDistribution.map((entry, index) => (
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