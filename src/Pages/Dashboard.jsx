import React from 'react';
import { Grid, Box, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StatCard from '../Components/Dashboard/StatCard';
import PointsChart from '../Components/Dashboard/PointsChart';
import RecentUsers from '../Components/Dashboard/RecentUsers';
import {
  People as PeopleIcon,
  CardGiftcard as PointsIcon,
  TrendingUp as TrendingUpIcon,
  Stars as StarsIcon
} from '@mui/icons-material';

// Mock Data
const mockPointsData = [
  { name: 'Jan', points: 4000 },
  { name: 'Feb', points: 3000 },
  { name: 'Mar', points: 5000 },
  { name: 'Apr', points: 2780 },
  { name: 'May', points: 6890 },
  { name: 'Jun', points: 2390 },
  { name: 'Jul', points: 3490 },
  { name: 'Aug', points: 4000 },
  { name: 'Sep', points: 7000 },
  { name: 'Oct', points: 8000 },
  { name: 'Nov', points: 6500 },
  { name: 'Dec', points: 9000 }
];

const mockRecentUsers = [
  {
    id: 1,
    enName: 'John Doe',
    arName: 'جون دو',
    email: 'john@example.com',
    points: 1500,
    createdAt: '2024-02-01T10:00:00.000Z'
  },
  {
    id: 2,
    enName: 'Sarah Smith',
    arName: 'سارة سميث',
    email: 'sarah@example.com',
    points: 2500,
    createdAt: '2024-02-05T15:30:00.000Z'
  },
  {
    id: 3,
    enName: 'Mohammed Ahmed',
    arName: 'محمد أحمد',
    email: 'mohammed@example.com',
    points: 3200,
    createdAt: '2024-02-08T09:15:00.000Z'
  },
  {
    id: 4,
    enName: 'Emily Brown',
    arName: 'إيميلي براون',
    email: 'emily@example.com',
    points: 1800,
    createdAt: '2024-02-10T14:20:00.000Z'
  }
];

const mockStats = {
  totalUsers: 1250,
  totalPoints: 156789,
  activeUsers: 890,
  averagePoints: 1250
};

const Dashboard = () => {
  const { t } = useTranslation();
  // const isRTL = i18n.language === 'ar';
  const isMobile = useMediaQuery('(max-width: 600px)');
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} sx={{width:'100%',flexDirection:isMobile ? 'column' : 'row',display:'flex', alignItems:'center',justifyContent:'center',margin:'0 auto' }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleIcon}
            title={t('Dashboard.TotalUsers')}
            value={mockStats.totalUsers.toLocaleString()}
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
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUpIcon}
            title={t('Dashboard.ActiveUsers')}
            value={mockStats.activeUsers.toLocaleString()}
            trend={15}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={StarsIcon}
            title={t('Dashboard.AveragePoints')}
            value={mockStats.averagePoints.toLocaleString()}
            trend={5}
            color="warning"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <PointsChart
            data={mockPointsData}
            title={t('Dashboard.PointsTrend')}
          />
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={4}>
          <RecentUsers users={mockRecentUsers} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;