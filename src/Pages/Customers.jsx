import React, { Suspense, lazy } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import { useTranslation } from "react-i18next";
import { Search } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { FaTrash, FaEdit, FaPlus, FaQrcode, FaEye } from "react-icons/fa";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import Spinner from '../utilities/Spinner';

const Box = lazy(() => import('@mui/material/Box'));
const Stack = lazy(() => import('@mui/material/Stack'));
const InputBase = lazy(() => import('@mui/material/InputBase'));
const IconButton = lazy(() => import('@mui/material/IconButton'));
const Table = lazy(() => import('@mui/material/Table'));
const TableBody = lazy(() => import('@mui/material/TableBody'));
const TableContainer = lazy(() => import('@mui/material/TableContainer'));
const TableHead = lazy(() => import('@mui/material/TableHead'));
const TableRow = lazy(() => import('@mui/material/TableRow'));
const TablePagination = lazy(() => import('@mui/material/TablePagination'));
const Paper = lazy(() => import('@mui/material/Paper'));
const Button = lazy(() => import('@mui/material/Button'));
const AddCustomer = lazy(() => import("../Components/Modals/AddCustomer"));
const DeleteModal = lazy(() => import("../Components/Modals/DeleteModal"));
const AddPointsModal = lazy(() => import("../Components/Modals/AddPointsModal")); 
const ScanQRModal = lazy(() => import("../Components/Modals/ScanQRModal"));


const Customers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    enName: "", 
    arName: "",
    email: "",
    phone: "",
  });
  const [openAddCustomer, setOpenAddCustomer] = useState(false);
  const [isLoadingAddCustomer, setIsLoadingAddCustomer] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [openAddPointsModal, setOpenAddPointsModal] = useState(false);
  const [customerToAddPoints, setCustomerToAddPoints] = useState(null);
  const [openScanQR, setOpenScanQR] = useState(false);
  const [scannedEmail, setScannedEmail] = useState("");

  const fetchCustomers = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      if (scannedEmail) queryParams.append("email", scannedEmail);
      queryParams.append('limit', rowsPerPage);

      const response = await Api.get(`/api/users/${page}?${queryParams}`);
      if (response?.data?.users) {
        setCustomers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        setCustomers([]);
        setTotalPages(0); 
      }
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchFilters, rowsPerPage, scannedEmail]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleDelete = async () => {
    if (!customerToDelete?.id) return;
    
    try {
      await Api.delete(`/api/users/${customerToDelete.id}`);
      notifySuccess(t("Customers.CustomerDeleted"));
      await fetchCustomers();
      setOpenDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleScanSuccess = (email) => {
    setSearchFilters((prev) => ({
      ...prev,
      email: email,
    }));
    setScannedEmail(email);
    setPage(1);
    notifySuccess(t("Customers.qrScanSuccess") + `: ${email}`);
  };

  const exportToPDF = async () => {
    try {
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const doc = new jsPDFModule.default();
      
      doc.addFont("./src/assets/fonts/Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("./src/assets/fonts/Amiri-Bold.ttf", "Amiri", "bold");
      
      doc.setFontSize(16);
      doc.text('Customers Report | Report Date: ' + new Date().toLocaleDateString(), 14, 15);
      
      const columns = ['ID', 'English Name', 'Arabic Name', 'Role', 'Email', 'Phone', 'Points'];
      const rows = customers.map(customer => [
        customer.id,
        customer.enName,
        customer.arName,
        customer.role,
        customer.email,
        customer.phone,
        customer.points
      ]);

      autoTableModule.default(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 128] },
        columnStyles: {
          2: {
            font: "Amiri",
            fontStyle: "bold",
            halign: 'right',
            cellWidth: 40,
            direction: 'rtl'
          }
        }
      });

      doc.save('customers_report.pdf');
    } catch (error) {
      console.error(error);
      notifyError(t("Errors.generalError"));
    }
  };

  const exportToCSV = async () => {
    try {
      const xlsxModule = await import('xlsx');
      const fields = ['id', 'enName', 'arName', 'role', 'email', 'phone', 'points'];
      const csv = xlsxModule.utils.json_to_sheet(customers, { header: fields });
      const workbook = xlsxModule.utils.book_new();
      xlsxModule.utils.book_append_sheet(workbook, csv, 'Customers');
      xlsxModule.writeFile(workbook, 'customers_report.xlsx');
    } catch (error) {
      console.error(error);
      notifyError(t("Errors.generalError"));
    }
  };

  return (
      <Box sx={{ p: 3, mt: 1 }}>
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
              <InputBase
                value={searchFilters.email}
                onChange={(e) => {
                  setSearchFilters((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  setScannedEmail("");
                  setPage(1);
                }}
                placeholder={t("Customers.SearchEmail")}
                sx={{
                  color: "text.primary",
                  textAlign: "center",
                  width: "200px",
                }}
              />
              <IconButton
                sx={{ color: "primary.main", padding: 0 }}
                onClick={handleSearch}
              >
                <Search />
              </IconButton>
              <Stack direction="row" spacing={1}>
                <IconButton
                  sx={{ color: "primary.main", padding: 0 }}
                  onClick={() => {
                    setScannedEmail("");
                    setPage(1);
                    setOpenScanQR(true);
                  }}
                  title={t("Customers.ScanQR")}
                >
                  <FaQrcode />
                </IconButton>
                {scannedEmail && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setScannedEmail("");
                      setPage(1);
                    }}
                    sx={{
                      fontSize: "12px",
                    }}
                  >
                    {t("Customers.ClearFilter")}
                  </Button>
                )}
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={exportToCSV}
              >
                {t("Customers.ExportCSV")}
              </Button>
              <Button
                variant="contained"
                onClick={exportToPDF}
              >
                {t("Customers.ExportPDF")}
              </Button>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenAddCustomer(true);
                setCustomer(null);
              }}
              sx={{ ml: 2 }}
            >
              {t("Customers.AddCustomer")}
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">{t("Customers.ID")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.EnglishName")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.ArabicName")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Role")}</StyledTableCell>
                <StyledTableCell align="center" sx={{ maxWidth: '300px' }}>{t("Customers.Email")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Phone")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Points")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.AddPoints")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.ViewTransactions")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Update")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Delete")}</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={10} align="center">
                    <Spinner />
                  </StyledTableCell>
                </StyledTableRow>
              ) : !customers || customers.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={10} align="center">
                    {t("Customers.NoCustomers")}
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                customers.slice(0, rowsPerPage).map((customer) => (
                  <StyledTableRow key={customer.id}>
                    <StyledTableCell align="center">{customer.id}</StyledTableCell>
                    <StyledTableCell align="center">{customer.enName}</StyledTableCell>
                    <StyledTableCell align="center">{customer.arName}</StyledTableCell>
                    <StyledTableCell align="center">
                      <Box sx={{ 
                        color: customer.role === 'ADMIN' ? '#1976d2' : 'inherit',
                        fontWeight: customer.role === 'ADMIN' ? 'bold' : 'normal'
                      }}>
                        {customer.role}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {customer.email}
                    </StyledTableCell>
                    <StyledTableCell align="center">{customer.phone}</StyledTableCell>
                    <StyledTableCell align="center">{customer.points}</StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setOpenAddPointsModal(true);
                          setCustomerToAddPoints(customer);
                        }}>
                        <FaPlus />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/transactions/${customer.id}`)}
                        title={t("Customers.ViewTransactions")}
                      >
                        <FaEye />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setOpenAddCustomer(true);
                          setCustomer(customer);
                        }}
                      >
                        <FaEdit color="green" />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setCustomerToDelete(customer);
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
            count={totalPages * rowsPerPage}
            page={page - 1}
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t("Customers.RowsPerPage")}
          />
        </TableContainer>

          {openAddCustomer && (
            <AddCustomer
              open={openAddCustomer}
              onClose={() => setOpenAddCustomer(false)}
              isLoading={isLoadingAddCustomer}
              setIsLoading={setIsLoadingAddCustomer}
              fetchCustomers={fetchCustomers}
              customer={customer}
            />
          )}
          {openDeleteModal && (
            <DeleteModal
              open={openDeleteModal}
              onClose={() => {
                setOpenDeleteModal(false);
                setCustomerToDelete(null);
              }}
              message={t("Customers.DeleteCustomerMessage")}
              title={t("Customers.DeleteCustomer")}
              onConfirm={handleDelete}
              isLoading={isLoading}
            />
          )}
          {openAddPointsModal && (
            <AddPointsModal
              open={openAddPointsModal}
              onClose={() => setOpenAddPointsModal(false)}
              customer={customerToAddPoints}
              fetchCustomers={fetchCustomers}
            />
          )}
          {openScanQR && (
            <ScanQRModal
              open={openScanQR}
              onClose={() => {
                setOpenScanQR(false);
                setScannedEmail("");
              }}
              onScanSuccess={handleScanSuccess}
            />
          )}
      </Box>
  );
};

export default Customers;
