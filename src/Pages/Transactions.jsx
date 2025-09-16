import React from "react";
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
  Menu,
  MenuItem,
  Chip,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import DeleteModal from "../Components/Modals/DeleteModal";
import { RestartAltOutlined } from "@mui/icons-material";
import TransactionSearchModal from "../Components/Modals/TransactionSearchModal";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as xlsx from "xlsx";
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
  const [pdfAnchorEl, setPdfAnchorEl] = useState(null);
  const [excelAnchorEl, setExcelAnchorEl] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    fromDate: null,
    toDate: null,
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const profile = useUser();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  
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

    const response = await Api.get(`/api/transactions/${page}?${queryParams}`);
    return response.data;
  };

  const fetchAllTransactions = async () => {
    const response = await Api.get(`/api/transactions/all-transactions`);
    return response.data;
  };

  const handlePdfClick = (event) => {
    const buttonElement = event.currentTarget;
    setPdfAnchorEl(buttonElement);
  };

  const handleExcelClick = (event) => {
    const buttonElement = event.currentTarget;
    setExcelAnchorEl(buttonElement);
  };

  const handlePdfClose = () => {
    setPdfAnchorEl(null);
  };

  const handleExcelClose = () => {
    setExcelAnchorEl(null);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, filters, customerId, rowsPerPage],
    queryFn: fetchTransactions,
    keepPreviousData: true,
    staleTime: 30000,
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

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1);
  };

  const handleDelete = () => {
    if (!transactionToDelete?.id) return;
    deleteMutation.mutate(transactionToDelete.id);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getArabicName = (transaction) => {
    if (i18n.language === "ar") {
      return String(transaction.user.arName).normalize("NFC");
    }
    return transaction.user.enName;
  };

  const exportToCSV = async (exportAll = false) => {
    try {
      let exportData;
      const date = dayjs(transactions.date).format("YYYY-MM-DD");
      if (exportAll) {
        const allTransactions = await fetchAllTransactions();
        exportData = allTransactions.map((transaction) => ({
          ID: transaction.id,
          Name: getArabicName(transaction),
          Points: transaction.points,
          Currency:
            i18n.language === "ar"
              ? transaction.currency.arCurrency
              : transaction.currency.enCurrency,
          Type: transaction.type,
          Date: date,
        }));
      } else {
        exportData = transactions.map((transaction) => ({
          ID: transaction.id,
          Name: getArabicName(transaction),
          Points: transaction.points,
          Currency:
            i18n.language === "ar"
              ? transaction.currency.arCurrency
              : transaction.currency.enCurrency,
          Type: transaction.type,
          Date: date,
        }));
      }

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");
      xlsx.writeFile(workbook, "transactions_report.xlsx");
      handleExcelClose();
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError"));
    }
  };

  const exportToPDF = async (exportAll = false) => {
    try {
      let dataToExport;

      if (exportAll) {
        dataToExport = await fetchAllTransactions();
      } else {
        dataToExport = transactions;
      }

      const doc = new jsPDF();

      doc.addFont("/assets/fonts/Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("/assets/fonts/Amiri-Bold.ttf", "Amiri", "bold");
      doc.setFont("Amiri");
      doc.setFontSize(16);
      doc.text(
        "Transactions Report | Report Date: " + new Date().toLocaleDateString(),
        14,
        15
      );

      const columns = [
        "ID",
        i18n.language === "ar" ? "Arabic Name" : "English Name",
        "Points",
        "Currency",
        "Type",
        "Date",
      ];

      const rows = dataToExport.map((transaction) => [
        transaction.id,
        getArabicName(transaction),
        transaction.points,
        i18n.language === "ar"
          ? transaction.currency.arCurrency
          : transaction.currency.enCurrency,
        transaction.type,
        dayjs(transaction.date).format("YYYY-MM-DD"),
      ]);

      autoTable(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 128] },
        columnStyles: {
          1: {
            font: "Amiri",
            fontStyle: "bold",
            halign: "center",
            cellWidth: 30,
            direction: i18n.language === "ar" ? "rtl" : "ltr",
          },
          3: {
            font: "Amiri",
            fontStyle: "bold",
            halign: "center",
            cellWidth: 30,
            direction: i18n.language === "ar" ? "rtl" : "ltr",
          },
        },
      });

      doc.save("transactions_report.pdf");
      handlePdfClose();
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError"));
    }
  };

  // دالة لعرض بيانات المعاملة في شكل بطاقة للشاشات الصغيرة
  const renderTransactionCard = (transaction) => (
    <Card key={transaction.id} sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Transactions.ID")}:
            </Typography>
            <Typography variant="body2">{transaction.id}</Typography>
          </Box>
          
          {!customerId && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("Transactions.CustomerName")}:
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
              {t("Transactions.Points")}:
            </Typography>
            <Typography variant="body2">{transaction.points}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Transactions.Currency")}:
            </Typography>
            <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              {i18n.language === "ar"
                ? transaction.currency.arCurrency
                : transaction.currency.enCurrency}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Transactions.Type")}:
            </Typography>
            <Chip
              label={t(`Transactions.${transaction.type}`)}
              color={transaction.type === "earn" ? "success" : "warning"}
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Transactions.Date")}:
            </Typography>
            <Typography variant="body2">
              {dayjs(transaction.date).format("DD/MM/YYYY hh:mm")}
            </Typography>
          </Box>
          
          {profile.role === "ADMIN" && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
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

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Helmet>
        <title>{t("Transactions.Transactions")}</title>
        <meta
          name="description"
          content={t("Transactions.TransactionsDescription")}
        />
      </Helmet>
      
      {/* Back button and customer info for customer-specific view */}
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
            <Button
              variant="outlined"
              startIcon={<FileExcelOutlined />}
              onClick={handleExcelClick}
              sx={{
                width: { xs: "100%", sm: "auto" },
                height: "40px", 
                fontSize: "12px",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
                display: profile.role === "ADMIN" ? "" : "none"
              }}
            >
              {t("Transactions.ExportCSV")}
            </Button>
            <Menu
              anchorEl={excelAnchorEl}
              open={Boolean(excelAnchorEl)}
              onClose={handleExcelClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: "200px",
                },
              }}
            >
              <MenuItem onClick={() => exportToCSV(false)}>
                {t("Transactions.CurrentPage")}
              </MenuItem>
              <MenuItem onClick={() => exportToCSV(true)}>
                {t("Transactions.AllPages")}
              </MenuItem>
            </Menu>

            <Button
              variant="outlined"
              startIcon={<FilePdfOutlined />}
              onClick={handlePdfClick}
              sx={{
                width: { xs: "100%", sm: "auto" },
                height: "40px",
                fontSize: "12px",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
                display: profile.role === "ADMIN" ? "" : "none"
              }}
            >
              {t("Transactions.ExportPDF")}
            </Button>
            <Menu
              anchorEl={pdfAnchorEl}
              open={Boolean(pdfAnchorEl)}
              onClose={handlePdfClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: "200px",
                },
              }}
            >
              <MenuItem onClick={() => exportToPDF(false)}>
                {t("Transactions.CurrentPage")}
              </MenuItem>
              <MenuItem onClick={() => exportToPDF(true)}>
                {t("Transactions.AllPages")}
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      </Box>

      {/* عرض الجدول للشاشات الكبيرة والبطاقات للشاشات الصغيرة */}
      {!isMobile ? (
        <TableContainer component={Paper} sx={{ maxHeight: 650, width: "100%" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {t("Transactions.ID")}
                </StyledTableCell>
                {!customerId && (
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {t("Transactions.CustomerName")}
                  </StyledTableCell>
                )}
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {t("Transactions.Points")}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {t("Transactions.Currency")}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {t("Transactions.Type")}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {t("Transactions.Date")}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    display: profile.role === "ADMIN" ? "" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Transactions.Delete")}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={customerId ? 7 : 8} align="center">
                    <Spin size="large" />
                  </StyledTableCell>
                </StyledTableRow>
              ) : !transactions || transactions.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={customerId ? 7 : 8} align="center">
                    {t("Transactions.NoTransactions")}
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                transactions.map((transaction) => (
                  <StyledTableRow key={transaction.id}>
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
                    <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {dayjs(transaction.date).format("DD/MM/YYYY hh:mm")}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
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
                      >
                        <DeleteOutlined />
                      </IconButton>
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
    </Box>
  );
};

export default Transactions;