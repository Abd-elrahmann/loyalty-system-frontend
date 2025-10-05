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
  Box,
  TableSortLabel,
  Checkbox
} from "@mui/material";
import { EyeOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StyledTableCell, StyledTableRow } from "../../Components/Shared/tableLayout";
import { Skeleton } from "antd";
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
  isAllSelected,
      
}) => {
  const { t, i18n } = useTranslation();

  const nameField = i18n.language === "ar" ? "arName" : "enName";

// Skeleton rows for loading state - معدلة
const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => (
  <StyledTableRow key={`skeleton-${index}`}>
    <StyledTableCell padding="checkbox">
      <Skeleton.Input 
        active 
        size="small" 
        style={{ 
          width: 20, 
          height: 20,
          display: 'block',
          margin: '0 auto'
        }} 
      />
    </StyledTableCell>
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
            width: 150, 
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
            width: 60, 
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
            width: 40, 
            height: 20,
            minWidth: 'auto'
          }} 
        />
      </Box>
    </StyledTableCell>
    <StyledTableCell align="center">
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Skeleton.Button 
          active 
          size="small" 
          style={{ 
            width: 30, 
            height: 30,
            minWidth: 'auto'
          }} 
        />
        <Skeleton.Button 
          active 
          size="small" 
          style={{ 
            width: 30, 
            height: 30,
            minWidth: 'auto'
          }} 
        />
        <Skeleton.Button 
          active 
          size="small" 
          style={{ 
            width: 30, 
            height: 30,
            minWidth: 'auto'
          }} 
        />
      </Box>
    </StyledTableCell>
  </StyledTableRow>
));

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 650, overflowX: 'auto', width: '100%' }}>
      <Table stickyHeader size="small">
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
            skeletonRows
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
                <StyledTableCell align="center">{customer.phone}</StyledTableCell>
                <StyledTableCell align="center">{customer.points}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => onShowQR(customer)}
                    title={t("Customers.ShowQR")}
                  >
                    <QrcodeOutlined />
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell align="center">{dayjs(customer.createdAt).format('DD/MM/YYYY hh:mm')}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => onAddPoints(customer)}
                  >
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
                      title={t("Customers.Edit")}
                    >
                      <EditOutlined color="warning" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => onDelete(customer)}
                      title={t("Customers.Delete")}
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