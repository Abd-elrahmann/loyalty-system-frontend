import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../Config/Api";
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import { Helmet } from 'react-helmet-async';
import { Box, Stack, Typography, TablePagination } from '@mui/material';
import { Skeleton } from "antd";
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
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [openBulkDeleteModal, setOpenBulkDeleteModal] = useState(false);

  const [orderBy, setOrderBy] = useState(() => {
    const saved = localStorage.getItem('customers_sort_orderBy');
    return saved || "id";
  });
  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('customers_sort_order');
    return saved || "asc";
  });

  useEffect(() => {
    localStorage.setItem('customers_sort_orderBy', orderBy);
  }, [orderBy]);

  useEffect(() => {
    localStorage.setItem('customers_sort_order', order);
  }, [order]);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 400px)');
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(1);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

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
    queryParams.append('sortBy', orderBy);
    queryParams.append('sortOrder', order);

    const response = await Api.get(`/api/users/${page}?${queryParams}`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchFilters, rowsPerPage, scannedEmail, searchFilters.qrCode, orderBy, order],
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

  const bulkDeleteMutation = useMutation({
    mutationFn: (customerIds) => Api.delete('/api/users', { data: { ids: customerIds } }),
    onSuccess: () => {
      notifySuccess(t("Customers.CustomersDeleted"));
      queryClient.invalidateQueries(['customers']);
      setSelectedCustomers([]);
      setIsAllSelected(false);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  // Selection handlers
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCustomers([]);
      setIsAllSelected(false);
    } else {
      const allCustomerIds = customers.map(customer => customer.id);
      setSelectedCustomers(allCustomerIds);
      setIsAllSelected(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCustomers.length === 0) return;
    setOpenBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    bulkDeleteMutation.mutate(selectedCustomers);
    setOpenBulkDeleteModal(false);
  };

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
        selectedCount={selectedCustomers.length}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading}
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
          orderBy={orderBy}
          order={order}
          createSortHandler={createSortHandler}
          selectedCustomers={selectedCustomers}
          onSelectCustomer={handleSelectCustomer}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
        />
      ) : (
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Skeleton active />
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
                  isLoading={isLoading}
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
          ButtonText={t("Customers.Delete")}
        />
      )}
      {openAddPointsModal && (
        <AddPointsModal
          open={openAddPointsModal}
          onClose={() => setOpenAddPointsModal(false)}
          customer={customerToAddPoints}
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
      {openBulkDeleteModal && (
        <DeleteModal
          open={openBulkDeleteModal}
          onClose={() => setOpenBulkDeleteModal(false)}
          message={t("Customers.DeleteCustomerMessage")}
          title={t("Customers.DeleteSelected") + ` (${selectedCustomers.length})`}
          onConfirm={handleConfirmBulkDelete}
          isLoading={bulkDeleteMutation.isLoading}
          ButtonText={t("Customers.Delete")}
        />
      )}
    </Box>
  );
};

export default Customers;