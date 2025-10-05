import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Box,
} from "@mui/material";
import { Spin, Skeleton } from "antd";
import { StyledTableCell, StyledTableRow } from "../../Components/Shared/tableLayout";
import { useTranslation } from "react-i18next";

const LogsTable = ({
  logsData,
  isLoading,
  isFetching,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const { t, i18n } = useTranslation();

  const getActionColor = (action) => {
    switch (action) {
      case 'Login':
        return 'success';
      case 'Create':
        return 'primary'; 
      case 'Update':
        return 'warning';
      case 'Delete':
        return 'error';
      default:
        return 'default';
    }
  };

  const getScreenLabel = (screen) => {
    const screenLabels = {
      login: t('Logs.Login'),
      products: t('Logs.Products'),
      invoices: t('Logs.Invoices'),
      pos: t('Logs.PointOfSale'),
      redeem: t('Logs.Redeem'),
      rewards: t('Logs.Rewards'),
      managers: t('Logs.Managers'),
      settings: t('Logs.Settings'),
      transactions: t('Logs.Transactions'),
      customers: t('Logs.Customers')
    };
    return screenLabels[screen.toLowerCase()] || screen;
  };

  // Skeleton rows for loading state
  const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => (
    <StyledTableRow key={`skeleton-${index}`}>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 40,
              height: 20,
              minWidth: 'auto'
            }}
          />
        </Box>
      </StyledTableCell>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 120,
              height: 20,
              minWidth: 'auto'
            }}
          />
        </Box>
      </StyledTableCell>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 80,
              height: 20,
              minWidth: 'auto'
            }}
          />
        </Box>
      </StyledTableCell>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 100,
              height: 20,
              minWidth: 'auto'
            }}
          />
        </Box>
      </StyledTableCell>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 170,
              height: 20,
              minWidth: 'auto'
            }}
          />
        </Box>
      </StyledTableCell>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: 120,
              height: 20,
              minWidth: 'auto'
            }}
          />
        </Box>
      </StyledTableCell>
    </StyledTableRow>
  ));

  if (isLoading || isFetching) {
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("Logs.ID")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("Logs.User")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("Logs.Action")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("Logs.Screen")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("Logs.Message")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {t("Logs.Date & Time")}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skeletonRows}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {t("Logs.ID")}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {t("Logs.User")}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {t("Logs.Action")}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {t("Logs.Screen")}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {t("Logs.Message")}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {t("Logs.Date & Time")}
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center" sx={{marginRight: "10px",fontSize: "14px"}}>
                {t("Logs.NoLogsFound")}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            logs.map((log) => (
              <StyledTableRow key={log.id}>
                <StyledTableCell align="center">
                  {log.userId}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {i18n.language === 'ar' ? log.user?.arName : log.user?.enName}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={i18n.language === 'ar' ? t(`Logs.${log.table}`) : log.table}
                    color={getActionColor(log.table)}
                    size="medium"
                    variant="outlined"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={getScreenLabel(log.screen)}
                    color="primary"
                    size="medium"
                    variant="outlined"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" style={{ wordWrap: "break-word", maxWidth: "170px" }}>
                  {i18n.language === 'ar' ? log.arMessage : log.enMessage}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {log.formattedDate}
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        onPageChange={(event, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage={t("Logs.Rows per page")}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${t("Logs.of")} ${count !== -1 ? count : `${t("Logs.more than")} ${to}`}`
        }
      />
    </TableContainer>
  );
};

export default LogsTable;