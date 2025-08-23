import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Box,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const RecentUsers = ({ users = [] }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const formatDate = (date) => {
    return format(new Date(date), 'PPP p', {
      locale: i18n.language === 'ar' ? ar : enUS
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        {t('Dashboard.RecentUsers')}
      </Typography>

      <Table sx={{ minWidth: 650, width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('Dashboard.User')}</TableCell>
            <TableCell>{t('Dashboard.Points')}</TableCell>
            <TableCell align="right">{t('Dashboard.JoinDate')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={user.profileImage}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      bgcolor: theme.palette.primary.main
                    }}
                  >
                    {user[i18n.language === 'ar' ? 'arName' : 'enName']?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {user[i18n.language === 'ar' ? 'arName' : 'enName']}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600
                  }}
                >
                  {user.points}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" color="text.secondary">
                  {formatDate(user.createdAt)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default RecentUsers;
