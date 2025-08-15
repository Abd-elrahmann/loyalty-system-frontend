import React from 'react';
const Paper = React.lazy(() => import('@mui/material/Paper'));
const Typography = React.lazy(() => import('@mui/material/Typography'));
import { useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { alpha } from '@mui/material/styles';

const PointsChart = ({ data, title }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        minHeight: 400
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        {title}
      </Typography>
      
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="name" 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke={theme.palette.primary.main}
            fill={alpha(theme.palette.primary.main, 0.2)}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default PointsChart;
