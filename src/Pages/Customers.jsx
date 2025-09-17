import React from "react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import { useTranslation } from "react-i18next";
import { SearchOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import { DeleteOutlined, EditOutlined, PlusOutlined, QrcodeOutlined, EyeOutlined } from "@ant-design/icons";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { Helmet } from 'react-helmet-async';
import { Box, Stack, InputBase, IconButton, Table, TableBody, TableContainer, TableHead, TableRow, TablePagination, Paper, Button, Menu, MenuItem, Link, Chip, Typography, Card, CardContent } from '@mui/material';
import { Spin } from "antd";
import AddCustomer from "../Components/Modals/AddCustomer";
import DeleteModal from "../Components/Modals/DeleteModal";
import AddPointsModal from "../Components/Modals/AddPointsModal";
import ScanQRModal from "../Components/Modals/ScanQRModal";
import ShowQrModal from "../Components/Modals/ShowQrModal"; // New import
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import debounce from "lodash.debounce";
import { useMediaQuery } from "@mui/material";

const Customers = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    enName: "", 
    arName: "",
    email: "",
    phone: "",
    qrCode: "",
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
  const [searchValue, setSearchValue] = useState("");
  const [openShowQR, setOpenShowQR] = useState(false); // New state
  const [customerToShowQR, setCustomerToShowQR] = useState(null); // New state

  const [pdfAnchorEl, setPdfAnchorEl] = useState(null);
  const [excelAnchorEl, setExcelAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 400px)');
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchFilters((prev) => ({
        ...prev,
        email: value,
      }));
      setScannedEmail("");
      setPage(1);
    }, 800),
    []
  );

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

  const fetchCustomers = async () => {
    const queryParams = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    if (scannedEmail) queryParams.append("email", scannedEmail);
    if (searchFilters.qrCode) queryParams.append("qrCode", searchFilters.qrCode);
    queryParams.append('limit', rowsPerPage);

    const response = await Api.get(`/api/users/${page}?${queryParams}`);
    return response.data;
  };

  const fetchAllCustomers = async () => {
    const response = await Api.get(`/api/users/all-users`);
    return response.data.users || [];
  };

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchFilters, rowsPerPage, scannedEmail, searchFilters.qrCode],
    queryFn: fetchCustomers,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const customers = data?.users || [];

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

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
    setSearchValue(e.target.value);
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
  
  const exportToPDF = async (exportAll = false) => {
    try { 
      const allCustomers = await fetchAllCustomers();
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
      
      let dataToExport = [];
      if (exportAll && Array.isArray(allCustomers)) {
        dataToExport = allCustomers;
      } else if (!exportAll && Array.isArray(customers)) {
        dataToExport = customers.slice(0, rowsPerPage);
      }

      const rows = dataToExport.map(customer => [
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
      handlePdfClose();
    } catch (error) {
      console.error(error);
      notifyError(t("Errors.generalError"));
    }
  };

  const exportToCSV = async (exportAll = false) => {
    try {
      const xlsxModule = await import('xlsx');
      const allCustomers = await fetchAllCustomers();
      const dataToExport = exportAll ? allCustomers : customers.slice(0, rowsPerPage);
      const rows = dataToExport.map(customer => ({  
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
      handleExcelClose();
    } catch (error) {
      console.error(error);
      notifyError(t("Errors.generalError"));
    }
  };

  // Function to show QR code
  const handleShowQR = (customer) => {
    setCustomerToShowQR(customer);
    setOpenShowQR(true);
  };

  // دالة لعرض بيانات العميل في شكل بطاقة للشاشات الصغيرة
  const renderCustomerCard = (customer) => (
    <Card key={customer.id} sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.ID")}:
            </Typography>
            <Typography variant="body2">{customer.id}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Name")}:
            </Typography>
            <Typography variant="body2">
              {i18n.language === 'ar' ? customer.arName : customer.enName}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Role")}:
            </Typography>
            <Chip
              label={customer.role}
              size="small"
              sx={{
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'white',
                backgroundColor: customer.role === 'ADMIN' ? '#1677FF' : 'green',
                height: '24px'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Email")}:
            </Typography>
            <Link href={`mailto:${customer.email}`} underline="hover" color="black" sx={{ cursor: 'pointer', fontSize: '12px' }}>
              {customer.email}
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Phone")}:
            </Typography>
            <Typography variant="body2">{customer.phone}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.Points")}:
            </Typography>
            <Typography variant="body2">{customer.points}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.QRCode")}:
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleShowQR(customer)}
              title={t("Customers.ShowQR")}
            >
              <QrcodeOutlined />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t("Customers.CreatedAt")}:
            </Typography>
            <Typography variant="body2">
              {dayjs(customer.createdAt).format('DD/MM/YYYY hh:mm')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
            <IconButton
              size="small"
              color="success"
              onClick={() => {
                setOpenAddPointsModal(true);
                setCustomerToAddPoints(customer);
              }}
              title={t("Customers.AddPoints")}
            >
              <PlusOutlined />
            </IconButton>
            
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/transactions/${customer.id}`)}
              title={t("Customers.ViewTransactions")}
            >
              <EyeOutlined />
            </IconButton>
            
            <IconButton
              size="small"
              color="warning"
              onClick={() => {
                setOpenAddCustomer(true);
                setCustomer(customer);
              }}
              title={t("Customers.Update")}
            >
              <EditOutlined />
            </IconButton>
            
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => {
                setOpenDeleteModal(true);
                setCustomerToDelete(customer);
              }}
              title={t("Customers.Delete")}
            >
              <DeleteOutlined />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, mt: 1 }}>
      <Helmet>
        <title>{t("Customers.Customers")}</title>
        <meta name="description" content={t("Customers.CustomersDescription")} />
      </Helmet>
      
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
            <InputBase
              value={searchValue}
              onChange={handleSearch}
              placeholder={t("Customers.SearchEmail")}
              sx={{
                color: "text.primary",
                textAlign: "center",
                width: { xs: "100%", sm: "200px" },
                borderRadius: 1,
                px: 1,
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
                    width: isSmallMobile ? "100px" : "auto",
                    fontSize: "12px",
                  }}
                >
                  {t("Customers.ClearFilter")}
                </Button>
              )}
            </Stack>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ 
            mt: { xs: 2, sm: 0 },
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1
          }}>
            <Button
              variant="outlined"
              startIcon={<FileExcelOutlined />}
              onClick={handleExcelClick}
              sx={{
                width: { xs: "100%", sm: "auto" },
                height: { xs: "40px", sm: "40px" },
                fontSize: "12px",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {t("Customers.ExportCSV")}
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
              <MenuItem onClick={() => exportToCSV(false)}>{t("Customers.CurrentPage")}</MenuItem>
              <MenuItem onClick={() => exportToCSV(true)}>{t("Customers.AllPages")}</MenuItem>
            </Menu>

            <Button
              variant="outlined"
              startIcon={<FilePdfOutlined />}
              onClick={handlePdfClick}
              sx={{
                width: { xs: "100%", sm: "auto" },
                height: { xs: "40px", sm: "40px" },
                fontSize: "12px",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {t("Customers.ExportPDF")}
            </Button>
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
              <MenuItem onClick={() => exportToPDF(false)}>{t("Customers.CurrentPage")}</MenuItem>
              <MenuItem onClick={() => exportToPDF(true)}>{t("Customers.AllPages")}</MenuItem>
            </Menu>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenAddCustomer(true);
                setCustomer(null);
              }}
              sx={{
                width: { xs: "100%", sm: "auto" },
                height: { xs: "40px", sm: "40px" },
                fontSize: "12px",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {t("Customers.AddCustomer")}
            </Button>
          </Stack>
        </Box>
      </Box>

      {!isMobile ? (
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
                <StyledTableCell align="center">{t("Customers.QRCode")}</StyledTableCell>
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
                  <StyledTableCell colSpan={12} align="center">
                    <Spin size="large" />
                  </StyledTableCell>
                </StyledTableRow>
              ) : !customers || customers.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={12} align="center">
                    {t("Customers.NoCustomers")}
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                customers.slice(0, rowsPerPage).map((customer) => (
                  <StyledTableRow key={customer.id}>
                    <StyledTableCell align="center">{customer.id}</StyledTableCell>
                    <StyledTableCell align="center">{i18n.language === 'ar' ? customer.arName : customer.enName}</StyledTableCell>
                    <StyledTableCell align="center">
                        <Chip
                          label={customer.role}
                          variant="outlined"
                          sx={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            color:'white',
                            backgroundColor: customer.role === 'ADMIN' ? '#1677FF' : 'green'  
                          }}
                        />
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link href={`mailto:${customer.email}`} underline="hover" color="black" sx={{ cursor: 'pointer' }}>
                        {customer.email}
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell align="center">{customer.phone}</StyledTableCell>
                    <StyledTableCell align="center">{customer.points}</StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleShowQR(customer)}
                        title={t("Customers.ShowQR")}
                      >
                        <QrcodeOutlined />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="center">{dayjs(customer.createdAt).format('DD/MM/YYYY hh:mm')}</StyledTableCell>
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
            count={data?.totalCount || 0}
            page={page - 1}
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t("Customers.RowsPerPage")}
          />
        </TableContainer>
      ) : (
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Spin size="large" />
            </Box>
          ) : !customers || customers.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ p: 3 }}>
              {t("Customers.NoCustomers")}
            </Typography>
          ) : (
            <Stack spacing={2}>
              {customers.slice(0, rowsPerPage).map((customer) => renderCustomerCard(customer))}
            </Stack>
          )}
          
          <TablePagination
            component="div"
            count={data?.totalCount || 0}
            page={page - 1}
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t("Customers.RowsPerPage")}
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
      {openShowQR && (
        <ShowQrModal
          open={openShowQR}
          onClose={() => {
            setOpenShowQR(false);
            setCustomerToShowQR(null);
          }}
          customer={customerToShowQR}
        />
      )}
    </Box>
  );
};

export default Customers;