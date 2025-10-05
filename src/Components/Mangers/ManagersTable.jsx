import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import { EditOutlined, DeleteOutlined,SecurityScanOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StyledTableCell, StyledTableRow } from "../Shared/tableLayout";
import { Spin, Skeleton } from "antd";
import dayjs from "dayjs";

const ManagersTable = ({
  managers,
  isLoading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onPermissions
}) => {
  const { t, i18n } = useTranslation();

  const getRoleLabel = (role) => {
    if (i18n.language === 'ar') {
      switch(role) {
        case 'ADMIN': return 'مدير عام';
        case 'ACCOUNTANT': return 'محاسب';
        case 'CASHIER': return 'كاشير';
        default: return role;
      }
    }
    return role;
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return '#4CAF50';
      case 'ACCOUNTANT': return '#FFA500';
      case 'CASHIER': return '#0074BA';
      default: return '#4CAF50';
    }
  };

  // Skeleton rows for loading state
  const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => (
    <StyledTableRow key={`skeleton-${index}`}>
      <StyledTableCell align="center">
        <Skeleton.Input active size="small" style={{ width: 40, height: 20 }} />
      </StyledTableCell>
      <StyledTableCell align="center">
        <Skeleton.Input active style={{ width: 120, height: 20 }} />
      </StyledTableCell>
      <StyledTableCell align="center">
        <Skeleton.Input active style={{ width: 80, height: 24 }} />
      </StyledTableCell>
      <StyledTableCell align="center">
        <Skeleton.Input active style={{ width: 150, height: 20 }} />
      </StyledTableCell>
      <StyledTableCell align="center">
        <Skeleton.Input active style={{ width: 100, height: 20 }} />
      </StyledTableCell>
      <StyledTableCell align="center">
        <Skeleton.Input active style={{ width: 120, height: 20 }} />
      </StyledTableCell>
      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Skeleton.Avatar active size="small" shape="circle" />
          <Skeleton.Avatar active size="small" shape="circle" />
          <Skeleton.Avatar active size="small" shape="circle" />
        </Box>
      </StyledTableCell>
    </StyledTableRow>
  ));

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">{t("Mangers.ID")}</StyledTableCell>
            <StyledTableCell align="center" sx={{ maxWidth: '200px' }}>{t("Mangers.ManagerName")}</StyledTableCell>
            <StyledTableCell align="center">{t("Mangers.Role")}</StyledTableCell>
            <StyledTableCell align="center" sx={{ maxWidth: '200px' }}>{t("Mangers.Email")}</StyledTableCell>
            <StyledTableCell align="center">{t("Mangers.Phone")}</StyledTableCell>
            <StyledTableCell align="center">{t("Mangers.CreatedAt")}</StyledTableCell>
            <StyledTableCell align="center">{t("Mangers.Actions")}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            skeletonRows
          ) : !managers || managers.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                {t("Mangers.NoManagers")}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            managers.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((manager) => (
              <StyledTableRow key={manager.id}>
                <StyledTableCell align="center">{manager.id}</StyledTableCell>
                <StyledTableCell align="center">{i18n.language === 'ar' ? manager.arName : manager.enName}</StyledTableCell>
                <StyledTableCell align="center">
                  <Chip 
                    label={getRoleLabel(manager.role)}
                    variant="outlined"
                    sx={{
                      textTransform: 'uppercase',
                      color:'white',
                      backgroundColor: getRoleColor(manager.role)
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {manager.email}
                </StyledTableCell>
                <StyledTableCell align="center">{manager.phone}</StyledTableCell>
                <StyledTableCell align="center">{dayjs(manager.createdAt).format('DD/MM/YYYY hh:mm A')}</StyledTableCell>
                <StyledTableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onPermissions(manager)}
                      title={t("Mangers.Permissions")}
                    >
                      <SecurityScanOutlined />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => onEdit(manager)}
                      title={t("Mangers.Update")}
                    >
                      <EditOutlined />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => onDelete(manager)}
                      title={t("Mangers.Delete")}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalCount || 0}
        page={page - 1}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={t("Mangers.RowsPerPage")}
      />
    </TableContainer>
  );
};

export default ManagersTable;