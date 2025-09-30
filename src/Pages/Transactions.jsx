import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Stack,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import DeleteModal from "../Components/Modals/DeleteModal";
import TransactionSearchModal from "../Components/Modals/TransactionSearchModal";
import { useUser } from "../utilities/user";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TransactionsToolbar from "../Components/transactions/TransactionsToolbar";
import TransactionsTable from "../Components/transactions/TransactionsTable";
import TransactionsCard from "../Components/transactions/TransactionsCard";

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
  const customerInfo = customerId && transactions.length > 0 ? transactions[0].user : null;
  const totalPoints = customerId && transactions.length > 0
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

  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [openBulkDeleteModal, setOpenBulkDeleteModal] = useState(false);

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

  const handlePageChange = (e, newPage) => {
    setPage(newPage + 1);
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

      <TransactionsToolbar
        customerId={customerId}
        filters={filters}
        onSearch={() => setOpenSearchModal(true)}
        onResetFilters={() => {
          setFilters({ type: "", fromDate: null, toDate: null });
          setPage(1);
        }}
        selectedCount={selectedTransactions.length}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading}
      />

      {!isMobile ? (
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          customerId={customerId}
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          orderBy={orderBy}
          order={order}
          onSort={handleSort}
          profile={profile}
          selectedTransactions={selectedTransactions}
          onSelectTransaction={handleSelectTransaction}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          onCancelTransaction={(transaction) => {
            setOpenCancelModal(true);
            setTransactionToCancel(transaction);
          }}
          onDeleteTransaction={(transaction) => {
            setOpenDeleteModal(true);
            setTransactionToDelete(transaction);
          }}
        />
      ) : (
        <TransactionsCard
          transactions={transactions}
          isLoading={isLoading}
          customerId={customerId}
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          orderBy={orderBy}
          order={order}
          onSort={handleSort}
          profile={profile}
          onCancelTransaction={(transaction) => {
            setOpenCancelModal(true);
            setTransactionToCancel(transaction);
          }}
          onDeleteTransaction={(transaction) => {
            setOpenDeleteModal(true);
            setTransactionToDelete(transaction);
          }}
        />
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