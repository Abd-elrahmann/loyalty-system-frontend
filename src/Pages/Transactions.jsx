import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
  TableSortLabel,
  Checkbox
} from "@mui/material";

import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import DeleteModal from "../Components/Modals/DeleteModal";
import { RestartAltOutlined } from "@mui/icons-material";
import TransactionSearchModal from "../Components/Modals/TransactionSearchModal";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useUser } from "../utilities/user";
import { Helmet } from "react-helmet-async";
import { Spin } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Transactions = () => {
  const { t, i18n } = useTranslation();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    fromDate: null,
    toDate: null,
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState(null); 
  const profile = useUser();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [orderBy, setOrderBy] = useState(() => {
    const saved = localStorage.getItem('transactions_sort_orderBy');
    return saved || "id";
  });
  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('transactions_sort_order');
    return saved || "asc";
  });
  useEffect(() => {
    localStorage.setItem('transactions_sort_orderBy', orderBy);
  }, [orderBy]);
  useEffect(() => {
    localStorage.setItem('transactions_sort_order', order);
  }, [order]);
    
  const fetchTransactions = async () => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.fromDate)
      queryParams.append(
        "fromDate",
        dayjs(filters.fromDate).format("YYYY-MM-DD")
      );
    if (filters.toDate)
      queryParams.append("toDate", dayjs(filters.toDate).format("YYYY-MM-DD"));
    if (customerId) queryParams.append("userId", customerId);
    queryParams.append("limit", rowsPerPage);
    queryParams.append("page", page);
    queryParams.append("sortBy", orderBy);
    queryParams.append("sortOrder", order);
    const response = await Api.get(`/api/transactions/${page}?${queryParams}`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, filters, customerId, rowsPerPage, orderBy, order],
    queryFn: fetchTransactions,
    keepPreviousData: true,
    staleTime: 5000,
  });

  const transactions = data?.transactions || [];
  const totalItems = data?.total || 0;
  const customerInfo =
    customerId && transactions.length > 0 ? transactions[0].user : null;
  const totalPoints =
    customerId && transactions.length > 0
      ? transactions.reduce(
          (sum, transaction) =>
            sum +
            (transaction.type === "earn"
              ? transaction.points
              : -transaction.points),
          0
        )
      : 0;

  const deleteMutation = useMutation({
    mutationFn: (transactionId) =>
      Api.delete(`/api/transactions/${transactionId}`),
    onSuccess: () => {
      notifySuccess(t("Transactions.TransactionDeleted"));
      queryClient.invalidateQueries(["transactions"]);
      setOpenDeleteModal(false);
      setTransactionToDelete(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (transactionId) =>
      Api.post(`/api/transactions/${transactionId}/cancel`),
    onSuccess: () => {
      notifySuccess(t("Transactions.TransactionCancelled"));
      queryClient.invalidateQueries(["transactions"]);
      setOpenCancelModal(false);
      setTransactionToCancel(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    },
  });

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1);
  };

  const handleDelete = () => {
    if (!transactionToDelete?.id) return;
    deleteMutation.mutate(transactionToDelete.id);
  };

  const handleCancel = () => {
    if (!transactionToCancel?.id) return;
    cancelMutation.mutate(transactionToCancel.id);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrderBy(property);
    setOrder(isAsc ? "desc" : "asc");
  };

  const renderTransactionCard = (transaction) => (
    <Card key={transaction.id} sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              <TableSortLabel
                active={orderBy === "id"}
                direction={orderBy === "id" ? order : "asc"}
                onClick={() => handleSort("id")}
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
                  onClick={() => handleSort("user.name")}
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
                onClick={() => handleSort("points")}
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
                onClick={() => handleSort("currency.arCurrency")}
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
                onClick={() => handleSort("type")}
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
                onClick={() => handleSort("status")}
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
                onClick={() => handleSort("date")}
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
                  onClick={() => {
                    setOpenCancelModal(true);
                    setTransactionToCancel(transaction);
                  }}
                  title={t("Transactions.Cancel")}
                >
                  <CloseCircleOutlined />
                </IconButton>
              )}
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setOpenDeleteModal(true);
                  setTransactionToDelete(transaction);
                }}
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

  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [openBulkDeleteModal, setOpenBulkDeleteModal] = useState(false);

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (transactionIds) => Api.delete('/api/transactions', { data: { ids: transactionIds } }),
    onSuccess: () => {
      notifySuccess(t("Transactions.TransactionsDeleted"));
      queryClient.invalidateQueries(['transactions']);
      setSelectedTransactions([]);
      setIsAllSelected(false);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  // Selection handlers
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTransactions([]);
      setIsAllSelected(false);
    } else {
      const allTransactionIds = transactions.map(transaction => transaction.id);
      setSelectedTransactions(allTransactionIds);
      setIsAllSelected(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.length === 0) return;
    setOpenBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    bulkDeleteMutation.mutate(selectedTransactions);
    setOpenBulkDeleteModal(false);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Helmet>
        <title>{t("Transactions.Transactions")}</title>
        <meta
          name="description"
          content={t("Transactions.TransactionsDescription")}
        />
      </Helmet>

      {customerId && (
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowLeftOutlined />}
            onClick={() => navigate("/customers")}
            sx={{ mb: { xs: 1, sm: 2 } }}
          >
            {t("Transactions.BackToCustomers")}
          </Button>
          {customerInfo && (
            <Box
              sx={{
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                mr: { xs: 0, sm: 3 },
                border: "1px solid",
                borderColor: "divider",
                width: { xs: "100%", sm: "auto" }
              }}
            >
              <Typography variant="h6" sx={{ margin: "0 0 10px 0", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                {t("Customers.Customer")}:{" "}
                {i18n.language === "ar"
                  ? customerInfo.arName
                  : customerInfo.enName}
              </Typography>
              <Typography variant="body2" sx={{ margin: 0, color: "#666" }}>
                {t("Customers.Points")}: {totalPoints}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Stack direction={"row"} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            {!customerId && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setOpenSearchModal(true)}
                  sx={{
                    color: "#800080",
                    textAlign: "center",
                    fontSize: { xs: "12px", sm: "14px" },
                    width: { xs: "100%", sm: "auto" },
                    height: "40px",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  <SearchOutlined sx={{ fontSize: "20px", mr: 1 }} />
                  {t("Transactions.Search")}
                </Button>
                {(filters.type || filters.fromDate || filters.toDate) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFilters({
                        type: "",
                        fromDate: null,
                        toDate: null,
                      });
                      setPage(1);
                    }}
                    sx={{ 
                      width: { xs: "100%", sm: "auto" },
                      height: "40px",
                      fontSize: { xs: "12px", sm: "14px" },
                      textAlign: "center",
                    }}
                  >
                    <RestartAltOutlined sx={{ mr: 1 }} />
                    {t("Transactions.Reset")}
                  </Button>
                )}
              </>
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ 
            mt: { xs: 2, sm: 0 },
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            width: { xs: "100%", sm: "auto" }
          }}>
            {selectedTransactions.length > 0 && (
              <IconButton
                size="small"
                color="error"
                onClick={handleBulkDelete}
              >
                <DeleteOutlined /> ({selectedTransactions.length})
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>

          
      {!isMobile ? (
        <TableContainer component={Paper} sx={{ maxHeight: 650, width: "100%" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell padding="checkbox" sx={{ whiteSpace: "nowrap" }}>
                  <Checkbox
                    indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.length}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    sx={{ color: "white !important" }}
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "id"}
                    direction={orderBy === "id" ? order : "asc"}
                    onClick={() => handleSort("id")}
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
                      onClick={() => handleSort("user.name")}
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
                    onClick={() => handleSort("points")}
                    sx={{ color: "white !important" }}
                  >
                    {t("Transactions.Points")}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "currency.arCurrency"}
                    direction={orderBy === "currency.arCurrency" ? order : "asc"}
                    onClick={() => handleSort("currency.arCurrency")}
                    sx={{ color: "white !important" }}
                  >
                    {t("Transactions.Currency")}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "type"}
                    direction={orderBy === "type" ? order : "asc"}
                    onClick={() => handleSort("type")}
                    sx={{ color: "white !important" }}
                  >
                    {t("Transactions.Type")}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleSort("status")}
                    sx={{ color: "white !important" }}
                  >
                    {t("Transactions.Status")}
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "date"}
                    direction={orderBy === "date" ? order : "asc"}
                    onClick={() => handleSort("date")}
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
                <StyledTableRow>
                  <StyledTableCell colSpan={customerId ? 9 : 10} align="center">
                    <Spin size="large" />
                  </StyledTableCell>
                </StyledTableRow>
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
                        onChange={() => handleSelectTransaction(transaction.id)}
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
                            onClick={() => {
                              setOpenCancelModal(true);
                              setTransactionToCancel(transaction);
                            }}
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
                          onClick={() => {
                            setOpenDeleteModal(true);
                            setTransactionToDelete(transaction);
                          }}
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
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t("Transactions.RowsPerPage")}
          />
        </TableContainer>
      ) : (
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Spin size="large" />
            </Box>
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
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={handleChangeRowsPerPage}
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
      )}

      {!customerId && (
        <TransactionSearchModal
          open={openSearchModal}
          onClose={() => setOpenSearchModal(false)}
          onSearch={handleSearch}
        />
      )}

      <DeleteModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setTransactionToDelete(null);
        }}
        message={t("Transactions.DeleteTransactionMessage")}
        title={t("Transactions.DeleteTransaction")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isLoading}
      />

      <DeleteModal
        open={openCancelModal}
        ButtonText={t("Transactions.Cancel")}
        cancelText={t("Transactions.CancelNo")}
        confirmText={t("Transactions.CancelYes")}
          onClose={() => {
          setOpenCancelModal(false);
          setTransactionToCancel(null);
        }}
        message={t("Transactions.CancelTransactionMessage")}
        title={t("Transactions.CancelTransaction")}
        onConfirm={handleCancel}
        isLoading={cancelMutation.isLoading}
      />

      {openBulkDeleteModal && (
        <DeleteModal
          open={openBulkDeleteModal}
          onClose={() => setOpenBulkDeleteModal(false)}
          message={t("Transactions.DeleteTransactionMessage")}
          title={t("Transactions.DeleteSelected") + ` (${selectedTransactions.length})`}
          onConfirm={handleConfirmBulkDelete}
          isLoading={bulkDeleteMutation.isLoading}
        />
      )}
    </Box>
  );
};

export default Transactions;