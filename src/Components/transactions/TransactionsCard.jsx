import React from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  TablePagination,
  IconButton,
  Chip,
  TableSortLabel,
} from "@mui/material";
import { DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";
import dayjs from "dayjs";

const TransactionsCard = ({
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
  onCancelTransaction,
  onDeleteTransaction,
}) => {
  const { t, i18n } = useTranslation();

  const renderTransactionCard = (transaction) => (
    <Card key={transaction.id} sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "id"}
                direction={orderBy === "id" ? order : "asc"}
                onClick={() => onSort("id")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.ID")}:
              </TableSortLabel>
            </Typography>
            <Typography variant="body2">{transaction.id}</Typography>
          </Box>
          
          {!customerId && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                <TableSortLabel
                  active={orderBy === "user.name"}
                  direction={orderBy === "user.name" ? order : "asc"}
                  onClick={() => onSort("user.name")}
                  sx={{ color: "white !important" }}
                >
                  {t("Transactions.CustomerName")}:
                </TableSortLabel>
              </Typography> 
              <Typography variant="body2">
                {i18n.language === "ar"
                  ? transaction.user?.arName
                  : transaction.user?.enName}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "points"}
                direction={orderBy === "points" ? order : "asc"}
                onClick={() => onSort("points")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Points")}:
              </TableSortLabel>
            </Typography>
            <Typography variant="body2">{transaction.points}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "currency.arCurrency"}
                direction={orderBy === "currency.arCurrency" ? order : "asc"}
                onClick={() => onSort("currency.arCurrency")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Currency")}:
              </TableSortLabel>
            </Typography>
            <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              {i18n.language === "ar"
                ? transaction.currency.arCurrency
                : transaction.currency.enCurrency}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "type"}
                direction={orderBy === "type" ? order : "asc"}
                onClick={() => onSort("type")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Type")}:
              </TableSortLabel>
            </Typography>
            <Chip
              label={t(`Transactions.${transaction.type}`)}
              color={transaction.type === "earn" ? "success" : "warning"}
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "status"}
                direction={orderBy === "status" ? order : "asc"}
                onClick={() => onSort("status")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Status")}:
              </TableSortLabel>
            </Typography>
            <Chip
              label={transaction.status}
              color={transaction.status === "CANCELLED" ? "error" : "success"}
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "date"}
                direction={orderBy === "date" ? order : "asc"}
                onClick={() => onSort("date")}
                sx={{ color: "white !important" }}
              >
                {t("Transactions.Date")}:
              </TableSortLabel>
            </Typography>
            <Typography variant="body2">
              {dayjs(transaction.date).format("DD/MM/YYYY hh:mm A")}
            </Typography>
          </Box>
          
          {profile.role === "ADMIN" && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 1 }}>
              {transaction.status !== "CANCELLED" && (
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => onCancelTransaction(transaction)}
                  title={t("Transactions.Cancel")}
                >
                  <CloseCircleOutlined />
                </IconButton>
              )}
              <IconButton
                size="small"
                color="error"
                onClick={() => onDeleteTransaction(transaction)}
                title={t("Transactions.Delete")}
              >
                <DeleteOutlined />
              </IconButton>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  // Skeleton cards for loading state
  const skeletonCards = Array.from({ length: 5 }, (_, index) => (
    <Card key={`skeleton-${index}`} sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: 100, height: 20 }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: 80, height: 20 }} 
              />
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Skeleton.Button active size="small" style={{ width: 30, height: 30 }} />
            <Skeleton.Button active size="small" style={{ width: 30, height: 30 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  ));

  return (
    <Box>
      {isLoading ? (
        <Stack spacing={2}>
          {skeletonCards}
        </Stack>
      ) : !transactions || transactions.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ p: 3 }}>
          {t("Transactions.NoTransactions")}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {transactions.map((transaction) => renderTransactionCard(transaction))}
        </Stack>
      )}
      
      <TablePagination
        component="div"
        count={totalItems}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={t("Transactions.RowsPerPage")}
        sx={{ 
          overflow: 'auto',
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: 'center'
          }
        }}
      />
    </Box>
  );
};

export default TransactionsCard;