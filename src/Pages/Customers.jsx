import React from "react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import { Helmet } from 'react-helmet-async';
import { Box, Stack, Typography, TablePagination } from '@mui/material';
import { Spin } from "antd";
import AddCustomer from "../Components/Modals/AddCustomer";
import DeleteModal from "../Components/Modals/DeleteModal";
import AddPointsModal from "../Components/Modals/AddPointsModal";
import ScanQRModal from "../Components/Modals/ScanQRModal";
import ShowQrModal from "../Components/Modals/ShowQrModal"; 
import CustomerTable from "../Components/customers/CustomerTable";
import CustomerCard from "../Components/customers/CustomerCard";
import CustomerToolbar from "../Components/customers/CustomerToolbar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import debounce from "lodash.debounce";
import { useMediaQuery } from "@mui/material";

const Customers = () => {
  const { t } = useTranslation();
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
  const [openShowQR, setOpenShowQR] = useState(false);
  const [customerToShowQR, setCustomerToShowQR] = useState(null);


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


  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchFilters, rowsPerPage, scannedEmail, searchFilters.qrCode],
    queryFn: fetchCustomers,
    keepPreviousData: true,
    staleTime: 5000,
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

  const handleSearchClick = () => {
    setSearchFilters((prev) => ({
      ...prev,
      email: searchValue,
    }));
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

  const handlePageChange = (e, newPage) => {
    setPage(newPage + 1);
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

 

  const handleShowQR = (customer) => {
    setCustomerToShowQR(customer);
    setOpenShowQR(true);
  };

  const handleAddPoints = (customer) => {
    setOpenAddPointsModal(true);
    setCustomerToAddPoints(customer);
  };

  const handleEdit = (customer) => {
    setOpenAddCustomer(true);
    setCustomer(customer);
  };

  const handleDeleteCustomer = (customer) => {
    setOpenDeleteModal(true);
    setCustomerToDelete(customer);
  };

  const handleViewTransactions = (customerId) => {
    navigate(`/transactions/${customerId}`);
  };

  const handleScanQR = () => {
    setScannedEmail("");
    setPage(1);
    setOpenScanQR(true);
  };

  const handleClearFilter = () => {
    setScannedEmail("");
    setPage(1);
  };

  const handleAddCustomer = () => {
    setOpenAddCustomer(true);
    setCustomer(null);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, mt: 1 }}>
      <Helmet>
        <title>{t("Customers.Customers")}</title>
        <meta name="description" content={t("Customers.CustomersDescription")} />
      </Helmet>
      
      <CustomerToolbar
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onSearchClick={handleSearchClick}
        onScanQR={handleScanQR}
        scannedEmail={scannedEmail}
        onClearFilter={handleClearFilter}
        onAddCustomer={handleAddCustomer}
        isSmallMobile={isSmallMobile}
      />

      {!isMobile ? (
        <CustomerTable
          customers={customers}
          isLoading={isLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          data={data}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onShowQR={handleShowQR}
          onAddPoints={handleAddPoints}
          onEdit={handleEdit}
          onDelete={handleDeleteCustomer}
          onViewTransactions={handleViewTransactions}
        />
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
              {customers.slice(0, rowsPerPage).map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onShowQR={handleShowQR}
                  onAddPoints={handleAddPoints}
                  onEdit={handleEdit}
                  onDelete={handleDeleteCustomer}
                  onViewTransactions={handleViewTransactions}
                />
              ))}
            </Stack>
          )}
          
          <TablePagination
            component="div"
            count={data?.totalCount || 0}
            page={page - 1}
            onPageChange={handlePageChange}
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