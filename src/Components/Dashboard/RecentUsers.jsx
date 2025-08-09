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

const RecentUsers = ({ users }) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

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
        {isRTL ? 'أحدث المستخدمين' : 'Recent Users'}
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{isRTL ? 'المستخدم' : 'User'}</TableCell>
            <TableCell>{isRTL ? 'النقاط' : 'Points'}</TableCell>
            <TableCell align="right">{isRTL ? 'تاريخ التسجيل' : 'Join Date'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
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
                    {user[isRTL ? 'arName' : 'enName'].charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {user[isRTL ? 'arName' : 'enName']}
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
                  {format(new Date(user.createdAt), 'PPP', {
                    locale: isRTL ? ar : enUS
                  })}
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
