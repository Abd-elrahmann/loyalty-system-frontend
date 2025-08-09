import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const StatCard = ({ icon: Icon, title, value, trend, color = 'primary' }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: alpha(theme.palette[color].main, 0.1),
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette[color].main, 0.2),
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette[color].main, 0.2),
          color: theme.palette[color].main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ color: theme.palette[color].main, fontWeight: 600 }}>
          {value}
        </Typography>
        {trend && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: trend >= 0 ? 'success.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5
            }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default StatCard;
