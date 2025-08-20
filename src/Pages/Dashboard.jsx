import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, useTheme, Button, TextField,CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
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
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import Grid from '@mui/material/Grid';

const COLORS = ['#800080', '#b300b3', '#e600e6', '#ff33ff'];

const PERIODS = ['day', 'week', 'month', 'year'];

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
      {trend !== undefined && (
        <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}>
          {trend >= 0 ? `+${trend}%` : `${trend}%`} {t('Dashboard.fromLastPeriod')}
        </Typography>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    customersCount: 0,
    totalPoints: 0,
    avgPoints: 0,
    transactionsCount: 0,
    totalEarnPoints: 0,
    totalRedeemPoints: 0,
    topEarners: [],
    pointsDistribution: {},
    mostUsedProducts: []
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

  const pointsDistributionData = Object.entries(dashboardData.pointsDistribution || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }));

  const pointsComparisonData = [
    { name: t('Dashboard.TotalEarnPoints'), points: dashboardData.totalEarnPoints },
    { name: t('Dashboard.TotalRedeemPoints'), points: dashboardData.totalRedeemPoints }
  ];

  const exportToPDF = () => {

  };

  return (
    <>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ marginTop: '200px' }} />
      </Box>
    ) : (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
         <Stack direction="row" spacing={2} justifyContent="space-between">
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('Dashboard.SelectDate')}
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          
          {PERIODS.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'contained' : 'outlined'}
              onClick={() => setSelectedPeriod(period)}
              sx={{ textTransform: 'capitalize' }}
            >
              {t(`Dashboard.${period}`)}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>  
          <Button variant="contained" color="primary" onClick={exportToPDF} sx={{ marginBottom: '20px',width: '200px',display: 'flex',justifyContent: 'center',alignItems: 'center',margin: 'auto' }}>
            {t('Dashboard.DashboardReport')}
          </Button>
        </Box>
        </Stack>
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
              title={t('Dashboard.AvgPoints')}
              value={dashboardData.avgPoints.toLocaleString()}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CompareIcon}
              title={t('Dashboard.TransactionsCount')}
              value={dashboardData.transactionsCount.toLocaleString()}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Points Comparison Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>{t('Dashboard.PointsComparison')}</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pointsComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill="#800080" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Top Earners */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>
            <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
            {t('Dashboard.TopEarners')}
          </Typography>
          <Grid container spacing={2}>
            {dashboardData.topEarners.map((earner, index) => (
              <Grid item xs={12} sm={6} key={earner.userId}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {index + 1}. {i18n.language === 'ar' ? earner.arName : earner.enName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('Dashboard.Points')}: {earner.points.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Most Used Products Bar Chart */}
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
          <Typography variant="h6" mb={3}>{t('Dashboard.MostUsedProducts')}</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dashboardData.mostUsedProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={i18n.language === 'ar' ? 'arName' : 'enName'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name={t('Dashboard.Products')} 
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
                {t('Dashboard.TotalEarnPoints')}
              </Typography>
              <Typography variant="h5">{dashboardData.totalEarnPoints}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Dashboard.TotalRedeemPoints')}
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
    )}
    </>
  );
};

export default Dashboard;