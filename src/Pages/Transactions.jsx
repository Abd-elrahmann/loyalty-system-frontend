import React from "react";
import { useState, useEffect } from "react";
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
import { Search } from "@mui/icons-material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

const Transactions = () => {
  const { t } = useTranslation();
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

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.fromDate) queryParams.append("fromDate", dayjs(filters.fromDate).format('YYYY-MM-DD'));
      if (filters.toDate) queryParams.append("toDate", dayjs(filters.toDate).format('YYYY-MM-DD'));

      const response = await Api.get(`/api/transactions/${page}?${queryParams}`);
      if (response?.data?.transactions) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
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
  }, [page, filters]);

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
      const fields = ['id', 'enName', 'arName', 'points', 'type', 'date'];
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
        'Type',
        'Date'
      ];
      
        const rows = transactions.map(transaction => [
        transaction.id,
        transaction.user.enName,
        transaction.user.arName,
        transaction.type,
        transaction.points,
        new Date(transaction.date).toISOString().split('T')[0]
      ]);

      autoTable(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
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
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ p: 3 }}>
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
                <StyledTableCell colSpan={7} align="center">
                  <Spinner />
                </StyledTableCell>
              </StyledTableRow>
            ) : !transactions || transactions.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={7} align="center">
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
                      color: transaction.type === 'earn' ? 'green' : 
                             transaction.type === 'redeem' ? '#FFB800' : 'inherit'
                    }}>
                      {transaction.type}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {formatDate(transaction.date)}
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

      <TransactionSearchModal
        open={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        onSearch={handleSearch}
      />

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