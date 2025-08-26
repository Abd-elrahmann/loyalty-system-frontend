import React from "react";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import { useTranslation } from "react-i18next";
import { SearchOutlined, FilePdfOutlined,FileExcelOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import { DeleteOutlined, EditOutlined, PlusOutlined, QrcodeOutlined, EyeOutlined } from "@ant-design/icons";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { Helmet } from 'react-helmet-async';
import { Box, Stack, InputBase, IconButton, Table, TableBody, TableContainer, TableHead, TableRow, TablePagination, Paper, Button } from '@mui/material';
import { Spin } from "antd";
import AddCustomer from "../Components/Modals/AddCustomer";
import DeleteModal from "../Components/Modals/DeleteModal";
import AddPointsModal from "../Components/Modals/AddPointsModal";
import ScanQRModal from "../Components/Modals/ScanQRModal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Customers = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
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
    const queryParams = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    if (scannedEmail) queryParams.append("email", scannedEmail);
    queryParams.append('limit', rowsPerPage);

    const response = await Api.get(`/api/users/${page}?${queryParams}`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchFilters, rowsPerPage, scannedEmail],
    queryFn: fetchCustomers,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const customers = data?.users || [];
  const totalPages = data?.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: (customerId) => Api.delete(`/api/users/${customerId}`),
    onSuccess: () => {
      notifySuccess(t("Customers.CustomerDeleted"));
      queryClient.invalidateQueries(['customers']);
      setOpenDeleteModal(false);
      setCustomerToDelete(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const handleSearch = () => {
    setPage(1);
  };

  const handleDelete = async () => {
    if (!customerToDelete?.id) return;
    deleteMutation.mutate(customerToDelete.id);
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
      
      doc.addFont("/assets/fonts/Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("/assets/fonts/Amiri-Bold.ttf", "Amiri", "bold");
      doc.setFont("Amiri");
      doc.setFontSize(16);
      doc.text('Customers Report | Report Date: ' + new Date().toLocaleDateString(), 14, 15);

      const getArabicName = (customer) => {
        if (i18n.language === "ar") {
          return String(customer.arName).normalize("NFC");
        }
        return customer.enName;
      };

      const columns = ['ID', i18n.language === 'ar' ? 'Arabic Name' : 'English Name', 'Role', 'Email', 'Phone', 'Points', 'Created At'];
      const rows = customers.map(customer => [
        customer.id,
        getArabicName(customer),
        customer.role,
        customer.email,
        customer.phone,
        customer.points,
        customer.createdAt
      ]);

      autoTableModule.default(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: { 
          fontSize: 7,
          cellPadding: 1
        },
        headStyles: { 
          fillColor: [128, 0, 128],
          fontSize: 8
        },
        columnStyles: {
          1: {
            font: "Amiri",
            fontStyle: "bold",
            halign: 'right',
            cellWidth: 35,
            direction: 'rtl'
          }
        },
        margin: { left: 10, right: 10 }
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
  
      const rows = customers.map(customer => ({
        ID: customer.id,
        [i18n.language === 'ar' ? 'الاسم' : 'Name']: 
          i18n.language === 'ar' ? customer.arName : customer.enName,
        Role: customer.role,
        Email: customer.email,
        Phone: customer.phone,
        Points: customer.points,
        "Created At": customer.createdAt
      }));
  
      const worksheet = xlsxModule.utils.json_to_sheet(rows);
      const workbook = xlsxModule.utils.book_new();
      xlsxModule.utils.book_append_sheet(workbook, worksheet, 'Customers');
      xlsxModule.writeFile(workbook, 'customers_report.xlsx');
    } catch (error) {
      console.error(error);
      notifyError(t("Errors.generalError"));
    }
  };


  return (
      <Box sx={{ p: 3, mt: 1 }}>
        <Helmet>
          <title>{t("Customers.Customers")}</title>
          <meta name="description" content={t("Customers.CustomersDescription")} />
        </Helmet>
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
                <SearchOutlined  />
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
                  <QrcodeOutlined />
                </IconButton>
                {scannedEmail && (
                  <Button
                    variant="text"
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
                variant="outlined"
                startIcon={<FileExcelOutlined />}
                onClick={exportToCSV}
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                {t("Customers.ExportCSV")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilePdfOutlined />}
                onClick={exportToPDF}
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                {t("Customers.ExportPDF")}
              </Button>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenAddCustomer(true);
                setCustomer(null);
              }}
              sx={{ ml: 2,
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
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
                <StyledTableCell align="center">{t("Customers.Name")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Role")}</StyledTableCell>
                <StyledTableCell align="center" sx={{ maxWidth: '300px' }}>{t("Customers.Email")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Phone")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.Points")}</StyledTableCell>
                <StyledTableCell align="center">{t("Customers.CreatedAt")}</StyledTableCell>
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
                    <Spin size="large" />
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
                    <StyledTableCell align="center">{i18n.language === 'ar' ? customer.arName : customer.enName}</StyledTableCell>
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
                    <StyledTableCell align="center">{customer.createdAt}</StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          setOpenAddPointsModal(true);
                          setCustomerToAddPoints(customer);
                        }}>
                        <PlusOutlined />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/transactions/${customer.id}`)}
                        title={t("Customers.ViewTransactions")}
                      >
                        <EyeOutlined />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => {
                          setOpenAddCustomer(true);
                          setCustomer(customer);
                        }}
                      >
                        <EditOutlined color="warning" />
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
              isLoading={deleteMutation.isLoading}
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
