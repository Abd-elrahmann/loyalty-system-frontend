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
  Box,
  TableSortLabel,
  Checkbox,
  Chip
} from "@mui/material";
import { DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StyledTableCell, StyledTableRow } from "../Shared/tableLayout";
import { Skeleton, Spin } from "antd";
import dayjs from "dayjs";

const TransactionsTable = ({
  transactions,
  isLoading,
  customerId,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  orderBy,
  order,
  onSort,
  profile,
  selectedTransactions,
  onSelectTransaction,
  onSelectAll,
  isAllSelected,
  onCancelTransaction,
  onDeleteTransaction,
}) => {
  const { t, i18n } = useTranslation();

  // Skeleton rows for loading state
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
      {!customerId && (
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
      )}
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
              width: 120, 
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
        </Box>
      </StyledTableCell>
    </StyledTableRow>
  ));

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 650, width: "100%" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell padding="checkbox" sx={{ whiteSpace: "nowrap" }}>
              <Checkbox
                indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.length}
                checked={isAllSelected}
                onChange={onSelectAll}
                sx={{ color: "white !important" }}
              />
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              <TableSortLabel
                active={orderBy === "id"}
                direction={orderBy === "id" ? order : "asc"}
                onClick={() => onSort("id")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.ID")}
              </TableSortLabel>
            </StyledTableCell>
            {!customerId && (
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                <TableSortLabel
                  active={orderBy === "user.name"}
                  direction={orderBy === "user.name" ? order : "asc"}
                  onClick={() => onSort("user.name")}
                  sx={{ color: "white !important" }}
                >
                  {t("Transactions.CustomerName")}
                </TableSortLabel>
              </StyledTableCell>
            )}
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              <TableSortLabel
                active={orderBy === "points"}
                direction={orderBy === "points" ? order : "asc"}
                onClick={() => onSort("points")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Points")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              <TableSortLabel
                active={orderBy === "currency.arCurrency"}
                direction={orderBy === "currency.arCurrency" ? order : "asc"}
                onClick={() => onSort("currency.arCurrency")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Currency")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              <TableSortLabel
                active={orderBy === "type"}
                direction={orderBy === "type" ? order : "asc"}
                onClick={() => onSort("type")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Type")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              <TableSortLabel
                active={orderBy === "status"}
                direction={orderBy === "status" ? order : "asc"}
                onClick={() => onSort("status")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Status")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              <TableSortLabel
                active={orderBy === "date"}
                direction={orderBy === "date" ? order : "asc"}
                onClick={() => onSort("date")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Date")}
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{
                display: profile.role === "ADMIN" ? "" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {t("Transactions.Actions")}
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            skeletonRows
          ) : !transactions || transactions.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={customerId ? 9 : 10} align="center">
                {t("Transactions.NoTransactions")}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            transactions.map((transaction) => (
              <StyledTableRow key={transaction.id}>
                <StyledTableCell padding="checkbox" sx={{ whiteSpace: "nowrap" }}>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => onSelectTransaction(transaction.id)}
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {transaction.id}
                </StyledTableCell>
                {!customerId && (
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {i18n.language === "ar"
                      ? transaction.user?.arName
                      : transaction.user?.enName}
                  </StyledTableCell>
                )}
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {transaction.points}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <span
                    style={{
                      color: "#1976d2",
                      fontWeight: "bold",
                    }}
                  >
                    {i18n.language === "ar"
                      ? transaction.currency.arCurrency
                      : transaction.currency.enCurrency}
                  </span>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={t(`Transactions.${transaction.type}`)}
                    color={
                      transaction.type === "earn" ? "success" : "warning"
                    }
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  {transaction.status === "CANCELLED" ? (
                    <Chip
                      label={transaction.status}
                      color="error"
                      size="small"
                    />
                  ) : (
                    "-"
                  )}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {dayjs(transaction.date).format("DD/MM/YYYY hh:mm A")}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    {transaction.status !== "CANCELLED" && (
                      <IconButton
                        size="small"
                        color="warning"
                        sx={{
                          display: profile.role === "ADMIN" ? "" : "none",
                        }}
                        onClick={() => onCancelTransaction(transaction)}
                        title={t("Transactions.CancelTransaction")}
                      >
                        <CloseCircleOutlined />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      sx={{
                        display: profile.role === "ADMIN" ? "" : "none",
                      }}
                      onClick={() => onDeleteTransaction(transaction)}
                      title={t("Transactions.Delete")}
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
        count={totalItems}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={t("Transactions.RowsPerPage")}
      />
    </TableContainer>
  );
};

export default TransactionsTable;