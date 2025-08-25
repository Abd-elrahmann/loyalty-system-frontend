import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Box, Stack, Typography, useTheme, Button, TextField, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Api from '../Config/Api';
import { 
  CardGiftcard as PointsIcon,
  CompareArrows as CompareIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { Helmet } from 'react-helmet-async';
import { animate } from 'framer-motion';
import { useUser } from '../utilities/user';

const DashboardCharts = lazy(() => import('../Components/Dashboard/DashboardCharts'));

const PERIODS = ['day', 'week', 'month', 'year'];

// eslint-disable-next-line no-unused-vars
const StatCard = React.memo(({ icon: Icon, title, value, trend, color = 'primary' }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useUser();
  const [displayValue, setDisplayValue] = useState(0);
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  };

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
    <Box sx={{
      p: 3,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
      display: 'flex',
      justifyContent: user.role==='ADMIN' ? 'flex-start' : 'center',
      flexDirection: 'column',
      height: '100%',
      textAlign: { xs: 'center', sm: 'left' },
      '& h4': {
        fontSize: '1.5rem',
        lineHeight: 1.2,
        fontWeight: 600,
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: user.role==='ADMIN' ? { xs: 'center', sm: 'flex-start' } : 'center' }}>
        <Icon sx={{ color: colorMap[color], mr: 1 }} />
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography component="h4" variant="h4">
        {displayValue}
      </Typography>
      {trend !== undefined && (
        <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}>
          {trend >= 0 ? `+${trend}%` : `${trend}%`} {t('Dashboard.fromLastPeriod')}
        </Typography>
      )}
    </Box>
  );
});

const Dashboard = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  return (
    <>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ marginTop: '200px' }} />
      </Box>
    ) : (
    <Box sx={{ p: 3 }}>
      <Helmet>
        <title>{t('Dashboard.Dashboard')}</title>
        <meta name="description" content={t('Dashboard.DashboardDescription')} />
      </Helmet>
      <Stack spacing={3}>
        {/* Filters */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent={user.role === 'ADMIN' ? "space-between" : "center"}
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            width: { xs: '100%', sm: 'auto' }
          }}>
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
                sx={{ 
                  textTransform: 'capitalize',
                  minWidth: { xs: '80px', sm: 'auto' }
                }}
              >
                {t(`Dashboard.${period}`)}
              </Button>
            ))}
          </Box>
          {user.role === 'ADMIN' && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: { xs: '20px', sm: 0 },
              width: { xs: '100%', sm: 'auto' }
            }}>  
              <Button 
                variant="contained" 
                color="primary" 
                onClick={exportToPDF} 
                sx={{ 
                  width: { xs: '180px', sm: '200px' },
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}
              >
                {t('Dashboard.DashboardReport')}
              </Button>
            </Box>
          )}
        </Stack>

        {/* Stats Cards Row */}
        <Grid container spacing={3} sx={{ 
          width: '100%', 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>
            {user.role === 'ADMIN' && (
            <>
              <Grid item xs={12} sm={6} md={3} sx={{ 
                width: { xs: '100%', sm: '220px' },
                maxWidth: { xs: '300px', sm: '220px' },
                height: '100px',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <StatCard
                  icon={PeopleIcon}
                  title={t('Dashboard.TotalCustomers')}
                  value={dashboardData.customersCount.toLocaleString()}
                  color="primary"
                />
              </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ 
            width: { xs: '100%', sm: '220px' },
            maxWidth: { xs: '300px', sm: '220px' },
            height: '100px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <StatCard
              icon={PointsIcon}
              title={t('Dashboard.TotalPoints')}
              value={dashboardData.totalPoints.toLocaleString()}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ 
            width: { xs: '100%', sm: '220px' },
            maxWidth: { xs: '300px', sm: '220px' },
            height: '100px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <StatCard
              icon={AssessmentIcon}
              title={t('Dashboard.AvgPoints')}
              value={dashboardData.avgPoints.toLocaleString()}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ 
            width: { xs: '100%', sm: '220px' },
            maxWidth: { xs: '300px', sm: '220px' },
            height: '100px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <StatCard
              icon={CompareIcon}
              title={t('Dashboard.TransactionsCount')}
              value={dashboardData.transactionsCount.toLocaleString()}
              color="info"
            />
          </Grid>
        
        
            </>
          )}
        </Grid>

        {/* Charts Section */}
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        }>
          <DashboardCharts dashboardData={dashboardData} />
        </Suspense>
      </Stack>
    </Box>
    )}
    </>
  );
};

export default Dashboard;