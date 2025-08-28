import React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import dayjs from 'dayjs';
import { Box, Button, Stack, IconButton, Table, TableBody, TableContainer, TableHead, TableRow, TablePagination, Paper, Menu, MenuItem } from '@mui/material';

import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { useTranslation } from "react-i18next";
import { DeleteOutlined } from "@ant-design/icons";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import DeleteModal from "../Components/Modals/DeleteModal";

import TransactionSearchModal from "../Components/Modals/TransactionSearchModal";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';
import { useUser } from '../utilities/user';
import { Helmet } from 'react-helmet-async';
import { Spin } from "antd";  
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const fetchTransactions = async () => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.fromDate) queryParams.append("fromDate", dayjs(filters.fromDate).format('YYYY-MM-DD'));
    if (filters.toDate) queryParams.append("toDate", dayjs(filters.toDate).format('YYYY-MM-DD'));
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
    // Get the button element that was clicked
    const buttonElement = event.currentTarget;
    setPdfAnchorEl(buttonElement);
  };

  const handleExcelClick = (event) => {
    // Get the button element that was clicked
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
    queryKey: ['transactions', page, filters, customerId, rowsPerPage],
    queryFn: fetchTransactions,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const transactions = data?.transactions || [];
  const totalItems = data?.total || 0;
  const customerInfo = customerId && transactions.length > 0 ? transactions[0].user : null;
  const totalPoints = customerId && transactions.length > 0 ? 
    transactions.reduce((sum, transaction) => 
      sum + (transaction.type === 'earn' ? transaction.points : -transaction.points), 0) : 0;

  const deleteMutation = useMutation({
    mutationFn: (transactionId) => Api.delete(`/api/transactions/${transactionId}`),
    onSuccess: () => {
      notifySuccess(t("Transactions.TransactionDeleted"));
      queryClient.invalidateQueries(['transactions']);
      setOpenDeleteModal(false);
      setTransactionToDelete(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
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
      const date = dayjs(transactions.date).format('YYYY-MM-DD');
      if (exportAll) {
        const allTransactions = await fetchAllTransactions();
        exportData = allTransactions.map(transaction => ({
          ID: transaction.id,
          'Name': getArabicName(transaction),
          Points: transaction.points,
          Currency: i18n.language === 'ar' ? transaction.currency.arCurrency : transaction.currency.enCurrency,
          Type: transaction.type,
          Date: date
        }));
      } else {
        exportData = transactions.map(transaction => ({
          ID: transaction.id,
          'Name': getArabicName(transaction),
          Points: transaction.points,
          Currency: i18n.language === 'ar' ? transaction.currency.arCurrency : transaction.currency.enCurrency,
          Type: transaction.type,
          Date: date
        }));
      }
  
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      xlsx.writeFile(workbook, 'transactions_report.xlsx');
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
      doc.text('Transactions Report | Report Date: ' + new Date().toLocaleDateString(), 14, 15);
      
      const columns = [
        'ID',
        i18n.language === 'ar' ? 'Arabic Name' : 'English Name', 
        'Points',
        'Currency',
        'Type',
        'Date'
      ];
  
      const rows = dataToExport.map(transaction => [
        transaction.id,
        getArabicName(transaction),
        transaction.points,
        i18n.language === 'ar' ? transaction.currency.arCurrency : transaction.currency.enCurrency,
        transaction.type,
        dayjs(transaction.date).format('YYYY-MM-DD')
      ]);
  
      autoTable(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 128] }, 
        columnStyles: {
          1: { 
            font: "Amiri",
            fontStyle: "bold",
            halign: 'center',
            cellWidth: 30,
            direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
          },
          3: {
            font: "Amiri",
            fontStyle: "bold",
            halign: 'center',
            cellWidth: 30,
            direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
          }
        }
      });
  
      doc.save('transactions_report.pdf');
      handlePdfClose();
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError")); 
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Helmet>
        <title>{t("Transactions.Transactions")}</title>
        <meta name="description" content={t("Transactions.TransactionsDescription")} />
      </Helmet>
      {/* Back button and customer info for customer-specific view */}
      {customerId && (
        <Box sx={{ mb: 3 , display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customers')}
            sx={{ mb: 2 }}
          >
            {t("Transactions.BackToCustomers")}
          </Button>
          {customerInfo && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1, 
              mr: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>
                {t("Customers.Customer")}: {i18n.language === 'ar' ? customerInfo.arName : customerInfo.enName} 
              </h3>
              <p style={{ margin: 0, color: '#666' }}>
                {t("Customers.Points")}: {totalPoints}
              </p>
            </Box>
          )}
        </Box>
      )}
      
      <Box sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Stack direction={"row"} spacing={1}>
            {!customerId && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setOpenSearchModal(true)}
                  sx={{
                    color: "#800080",
                    textAlign: "center",
                    fontSize: "14px",
                    width: "120px",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}>
                    <SearchOutlined sx={{ fontSize: "25px", ml: 4 }} />
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
                      textAlign: "center",
                      fontSize: "14px",
                    }}>
                    {t("Transactions.Reset")}
                  </Button>
                )}
              </>
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileExcelOutlined />}
              onClick={handleExcelClick}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {t("Transactions.ExportCSV")}
            </Button>
            <Menu
              anchorEl={excelAnchorEl}
              open={Boolean(excelAnchorEl)}
              onClose={handleExcelClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: '200px',
                }
              }}
            >
              <MenuItem onClick={() => exportToCSV(false)}>{t("Transactions.CurrentPage")}</MenuItem>
              <MenuItem onClick={() => exportToCSV(true)}>{t("Transactions.AllPages")}</MenuItem>
            </Menu>
            <Menu
              anchorEl={pdfAnchorEl}
              open={Boolean(pdfAnchorEl)}
              onClose={handlePdfClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: '200px',
                }
              }}
            >
              <MenuItem onClick={() => exportToPDF(false)}>{t("Transactions.CurrentPage")}</MenuItem>
              <MenuItem onClick={() => exportToPDF(true)}>{t("Transactions.AllPages")}</MenuItem>
            </Menu>
            <Button
              variant="outlined"
              startIcon={<FilePdfOutlined />}
              onClick={handlePdfClick}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {t("Transactions.ExportPDF")}
            </Button>
          </Stack>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 650 ,width: '100%' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                {t("Transactions.ID")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                {t("Transactions.CustomerName")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                {t("Transactions.Points")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                {t("Transactions.Currency")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                {t("Transactions.Type")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                {t("Transactions.Date")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ display: profile.role === 'ADMIN' ? '' : 'none' ,whiteSpace: 'nowrap'}}>
                {t("Transactions.Delete")}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={8} align="center">
                  <Spin size="large" />
                </StyledTableCell>
              </StyledTableRow>
            ) : !transactions || transactions.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={8} align="center">
                  {t("Transactions.NoTransactions")}
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              transactions.map((transaction) => (
                <StyledTableRow key={transaction.id}>
                    <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                    {transaction.id}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                    {i18n.language === 'ar' ? transaction.user?.arName : transaction.user?.enName}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                    {transaction.points}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                    <span style={{ 
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }}>
                      {i18n.language === 'ar' ? transaction.currency.arCurrency : transaction.currency.enCurrency}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <span style={{ 
                      color: transaction.type === 'earn' ? 'green' : 
                             transaction.type === 'redeem' ? '#FFB800' : 'inherit'
                    }}>
                      {transaction.type}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                    {dayjs(transaction.date).format('DD/MM/YYYY hh:mm')}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                    <IconButton 
                      size="small" 
                      color="error" 
                      sx={{
                        display: profile.role === 'ADMIN' ? '' : 'none',
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
           onPageChange={(e, newPage) => setPage(newPage + 1)}
           rowsPerPage={rowsPerPage}
           rowsPerPageOptions={[5, 10, 20]}
           onRowsPerPageChange={handleChangeRowsPerPage}
           labelRowsPerPage={t("Transactions.RowsPerPage")}
        />
      </TableContainer>

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