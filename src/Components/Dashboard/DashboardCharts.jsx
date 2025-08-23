import React, { memo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts/es6';

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
        labelLine= {true}
        label={({ name, value }) => value > 0 ? `${name}: ${value}%` : ""}
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

  const pointsDistributionData = Object.entries(dashboardData.pointsDistribution || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }));

  const pointsComparisonData = [
    { name: t('Dashboard.TotalEarnPoints'), points: dashboardData.totalEarnPoints },
    { name: t('Dashboard.TotalRedeemPoints'), points: dashboardData.totalRedeemPoints }
  ];

  return (
    <>
      <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            mb: 3,
            display: 'block'
          }}
        >
          {t('Dashboard.PointsComparison')}
        </Typography>
        <PointsComparisonChart data={pointsComparisonData} />
      </Box>

      <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            mb: 3,
            display: 'block'
          }}
        >
          <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
          {t('Dashboard.TopEarners')}
        </Typography>
        <Grid container spacing={2} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
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

      <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            mb: 3,
            display: 'block'
          }}
        >
          {t('Dashboard.MostUsedProducts')}
        </Typography>
        <ProductsChart 
          data={dashboardData.mostUsedProducts}
          nameKey={i18n.language === 'ar' ? 'arName' : 'enName'}
        />
      </Box>

      <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            mb: 3,
            display: 'block'
          }}
        >
          {t('Dashboard.PointsDistribution')}
        </Typography>
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
        <DistributionChart data={pointsDistributionData} />
      </Box>
    </>
  );
});

PointsComparisonChart.displayName = 'PointsComparisonChart';
ProductsChart.displayName = 'ProductsChart';
DistributionChart.displayName = 'DistributionChart';
DashboardCharts.displayName = 'DashboardCharts';

export default DashboardCharts;