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
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  StyledTableCell,
  StyledTableRow,
} from "../Shared/tableLayout";
const RecentUsers = ({ users = [] }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
        <TableHead>
          <StyledTableRow>
            {!isMobile ? (
              <>
                <StyledTableCell>{t('Dashboard.User')}</StyledTableCell>
                <StyledTableCell>{t('Dashboard.Points')}</StyledTableCell>
                <StyledTableCell align="right" sx={{display:isMobile ? 'none' : 'block'}}>{t('Dashboard.JoinDate')}</StyledTableCell>
              </>
            ) : (
              <StyledTableCell>{t('Dashboard.User')}</StyledTableCell>
            )}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {users?.map((user) => (
            <StyledTableRow key={user.id}>
              <StyledTableCell>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={user.profileImage}
                      sx={{ 
                        width: 30, 
                        height: 30,
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
                  {isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600
                        }}
                      >
                        {user.points} {t('Dashboard.Points')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{display:isMobile ? 'none' : 'block'}}>
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </StyledTableCell>
              {!isMobile && (
                <>
                  <StyledTableCell>
                    <Typography
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600
                      }}
                    >
                      {user.points}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right" sx={{display:isMobile ? 'none' : 'block'}}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </StyledTableCell>
                </>
              )}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default RecentUsers;
