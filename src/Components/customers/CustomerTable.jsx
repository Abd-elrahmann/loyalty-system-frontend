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
  TableSortLabel,
  Checkbox
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
  onViewTransactions,
  orderBy,
  order,
  createSortHandler,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll,
  isAllSelected
}) => {
  const { t, i18n } = useTranslation();

  const nameField = i18n.language === "ar" ? "arName" : "enName";

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < customers.length}
                checked={isAllSelected}
                onChange={onSelectAll}
                sx={{ color: "white !important" }}
              />
            </StyledTableCell>
            <StyledTableCell align="center">
              <TableSortLabel
                active={orderBy === "id"}
                direction={orderBy === "id" ? order : "asc"}
                onClick={createSortHandler("id")}
                sx={{ color: "white !important" }}
              >
                {t("Customers.ID")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ maxWidth: '200px' }}>
              <TableSortLabel
                active={orderBy === nameField}
                direction={orderBy === nameField ? order : "asc"}
                onClick={createSortHandler(nameField)}
                sx={{ color: "white !important" }}
              >
                {t("Customers.Name")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ maxWidth: '200px' }}>
              <TableSortLabel
                active={orderBy === "email"}
                direction={orderBy === "email" ? order : "asc"}
                onClick={createSortHandler("email")}
                sx={{ color: "white !important" }}
              >
                {t("Customers.Email")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center">
              <TableSortLabel
                active={orderBy === "phone"}
                direction={orderBy === "phone" ? order : "asc"}
                onClick={createSortHandler("phone")}
                sx={{ color: "white !important" }}
              >
                {t("Customers.Phone")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center">
              <TableSortLabel
                active={orderBy === "points"}
                direction={orderBy === "points" ? order : "asc"}
                onClick={createSortHandler("points")}
                sx={{ color: "white !important" }}
              >
                {t("Customers.Points")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center">{t("Customers.QRCode")}</StyledTableCell>
            <StyledTableCell align="center">
              <TableSortLabel
                active={orderBy === "createdAt"}
                direction={orderBy === "createdAt" ? order : "asc"}
                onClick={createSortHandler("createdAt")}
                sx={{ color: "white !important" }}
                >
                {t("Customers.CreatedAt")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center">{t("Customers.AddPoints")}</StyledTableCell>
            <StyledTableCell align="center">{t("Customers.Actions")}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={11} align="center">
                <Spin size="large" />
              </StyledTableCell>
            </StyledTableRow>
          ) : !customers || customers.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={11} align="center">
                {t("Customers.NoCustomers")}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            customers.slice(0, rowsPerPage).map((customer) => (
              <StyledTableRow key={customer.id}>
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => onSelectCustomer(customer.id)}
                  />
                </StyledTableCell>
                <StyledTableCell align="center">{customer.id}</StyledTableCell>
                <StyledTableCell align="center">{i18n.language === 'ar' ? customer.arName : customer.enName}</StyledTableCell>
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