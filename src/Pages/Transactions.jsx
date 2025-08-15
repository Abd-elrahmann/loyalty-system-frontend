import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import dayjs from 'dayjs';
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
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import DeleteModal from "../Components/Modals/DeleteModal";
import Spinner from '../utilities/Spinner';
import TransactionSearchModal from "../Components/Modals/TransactionSearchModal";
import { Search, ArrowBack } from "@mui/icons-material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

const Transactions = () => {
  const { t, i18n } = useTranslation();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    fromDate: null,
    toDate: null,
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  
  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.fromDate) queryParams.append("fromDate", dayjs(filters.fromDate).format('YYYY-MM-DD'));
      if (filters.toDate) queryParams.append("toDate", dayjs(filters.toDate).format('YYYY-MM-DD'));
      if (customerId) queryParams.append("userId", customerId);

      const response = await Api.get(`/api/transactions/${page}?${queryParams}`);
      if (response?.data?.transactions) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
        
        // Calculate total points for customer
        if (customerId && response.data.transactions.length > 0) {
          const points = response.data.transactions.reduce((sum, transaction) => {
            return sum + (transaction.type === 'earn' ? transaction.points : -transaction.points);
          }, 0);
          setTotalPoints(points);
          setCustomerInfo(response.data.transactions[0].user);
        }
      } else {
        setTransactions([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  

  useEffect(() => {
    fetchTransactions();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, customerId]);

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!transactionToDelete?.id) return;
    
    try {
      await Api.delete(`/api/transactions/${transactionToDelete.id}`);
      notifySuccess(t("Transactions.TransactionDeleted"));
      await fetchTransactions();
      setOpenDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };

  const exportToCSV = () => {
    try {
      const fields = ['id', 'enName', 'arName', 'points', 'currency', 'type', 'date'];
      const csv = xlsx.utils.json_to_sheet(transactions, { header: fields });
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, csv, 'Transactions');
      xlsx.writeFile(workbook, 'transactions_report.xlsx');
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError"));
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.addFont("./src/assets/fonts/Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("./src/assets/fonts/Amiri-Bold.ttf", "Amiri", "bold");
      
      doc.setFontSize(16);
      doc.text('Transactions Report', 14, 15);
      
      const columns = [
        'ID',
        'English Name', 
        'Arabic Name',
        'Points',
        'Currency',
        'Type',
        'Date'
      ];
      
      const rows = transactions.map(transaction => [
        transaction.id,
        transaction.user.enName,
        transaction.user.arName,
        transaction.points,
        transaction.currency || 'USD',
        transaction.type,
        transaction.formattedDate
      ]);

      autoTable(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 128] }, // Changed to #800080 (RGB: 128,0,128)
        columnStyles: {
          2: { 
            font: "Amiri",
            fontStyle: "bold",
            halign: 'right',
            cellWidth: 40,
            direction: 'rtl'
          }
        },
        didDrawCell: function(data) {
          if (data.column.index === 2 && data.cell.section === 'body') {
            const text = data.cell.text[0];
            if (text && /[\u0600-\u06FF]/.test(text)) {
              data.cell.text = [text];
            }
          }
        }
      });

      doc.save('transactions_report.pdf');
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError")); 
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Back button and customer info for customer-specific view */}
      {customerId && (
        <Box sx={{ mb: 3 , display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
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
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>
                {t("Transactions.CustomerTransactions")}: {i18n.language === 'ar' ? customerInfo.arName : customerInfo.enName} 
              </h3>
              <p style={{ margin: 0, color: '#666' }}>
                {t("Customers.Email")}: {customerInfo.email} | {t("Customers.Points")}: {totalPoints}
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
              <Button
                variant="contained"
                onClick={() => setOpenSearchModal(true)}
                sx={{
                  color: "white",
                  backgroundColor: "primary.main",
                  textAlign: "center",
                  fontSize: "14px",
                  width: "120px",

                }}>
                  <Search sx={{ fontSize: "25px", mr: 1 }} />
                  {t("Transactions.Search")}
                </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => exportToCSV()}
            >
              {t("Transactions.ExportCSV")}
            </Button>
            <Button
              variant="contained"
              onClick={() => exportToPDF()}
            >
              {t("Transactions.ExportPDF")}
            </Button>
          </Stack>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">
                {t("Transactions.ID")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.CustomerEnName")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.CustomerArName")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.Points")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.Currency")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.Type")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.Date")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Transactions.Delete")}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={8} align="center">
                  <Spinner />
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
                  <StyledTableCell align="center">
                    {transaction.id}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {transaction.user?.enName || '-'}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {transaction.user?.arName || '-'}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {transaction.points}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <span style={{ 
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }}>
                      {transaction.currency || 'USD'}
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
                  <StyledTableCell align="center">
                    {transaction.formattedDate}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setTransactionToDelete(transaction);
                      }}
                    >
                      <FaTrash />
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
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
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
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Transactions;