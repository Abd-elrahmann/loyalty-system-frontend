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
  Link,
  Chip,
  Box,
} from "@mui/material";
import { EyeOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StyledTableCell, StyledTableRow } from "../../Components/Shared/tableLayout";
import { Spin } from "antd";
import dayjs from "dayjs";

const CustomerTable = ({
  customers,
  isLoading,
  page,
  rowsPerPage,
  data,
  onPageChange,
  onRowsPerPageChange,
  onShowQR,
  onAddPoints,
  onEdit,
  onDelete,
  onViewTransactions
}) => {
  const { t, i18n } = useTranslation();

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">{t("Customers.ID")}</StyledTableCell>
            <StyledTableCell align="center" sx={{ maxWidth: '200px' }}>{t("Customers.Name")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.Role")}</StyledTableCell>
            <StyledTableCell align="center" sx={{ maxWidth: '200px' }}>{t("Customers.Email")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.Phone")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.Points")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.QRCode")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.CreatedAt")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.AddPoints")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.Actions")}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={10} align="center">
                <Spin size="large" />
              </StyledTableCell>
            </StyledTableRow>
          ) : !customers || customers.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={10} align="center">
                {t("Customers.NoCustomers")}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            customers.slice(0, rowsPerPage).map((customer) => (
              <StyledTableRow key={customer.id}>
                <StyledTableCell align="center">{customer.id}</StyledTableCell>
                <StyledTableCell align="center">{i18n.language === 'ar' ? customer.arName : customer.enName}</StyledTableCell>
                <StyledTableCell align="center">
                  <Chip 
                    label={i18n.language === 'ar' ? 
                      customer.role === 'ADMIN' ? 'مدير عام' :
                      customer.role === 'ACCOUNTANT' ? 'محاسب' :
                      customer.role === 'CASHIER' ? 'كاشير' :
                      'عميل'
                      : customer.role
                    }
                    variant="outlined"
                    sx={{
                      fontSize: i18n.language === 'ar' ? '14px' : '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color:'white',
                      backgroundColor: 
                        customer.role === 'ADMIN' ? '#1677FF' : 
                        customer.role === 'ACCOUNTANT' ? '#FFA500' :
                        customer.role === 'CASHIER' ? '#800080' :
                        '#4CAF50'
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Link href={`mailto:${customer.email}`} underline="hover" color="black" sx={{ cursor: 'pointer', fontSize: i18n.language === 'ar' ? '14px' : '13px' }}>
                    {customer.email}
                  </Link>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>{customer.phone}</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>{customer.points}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => onShowQR(customer)}
                    title={t("Customers.ShowQR")}
                  >
                    <QrcodeOutlined />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontSize: i18n.language === 'ar' ? '14px' : '12px' }}>{dayjs(customer.createdAt).format('DD/MM/YYYY hh:mm')}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => onAddPoints(customer)}>
                    <PlusOutlined />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onViewTransactions(customer.id)}
                      title={t("Customers.ViewTransactions")}
                    >
                      <EyeOutlined />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => onEdit(customer)}
                    >
                      <EditOutlined color="warning" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => onDelete(customer)}
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
        count={data?.totalCount || 0}
        page={page - 1}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={t("Customers.RowsPerPage")}
      />
    </TableContainer>
  );
};

export default CustomerTable;