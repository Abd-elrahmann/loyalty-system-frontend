import React from "react";
import { useState, useEffect } from "react";
import Api from "../Config/Api";
import {
  Box,
  Button,
  Stack,
  InputBase,
  IconButton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import AddIcon from "@mui/icons-material/Add";
import AddCustomer from "../Components/Modals/AddCustomer";
import { useTranslation } from "react-i18next";
import { Search } from "@mui/icons-material";
import { FaTrash, FaEdit } from "react-icons/fa";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import DeleteModal from "../Components/Modals/DeleteModal";
const Customers = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const fetchCustomers = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await Api.get(`/api/users/${page}?${queryParams}`);
      if (response?.data?.users) {
        setCustomers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        setCustomers([]);
        setTotalPages(0);
      }
      setIsLoading(false);
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
      setCustomers([]);
      setTotalPages(0);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchFilters]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleDelete = async () => {
    if (!customerToDelete?.id) return;
    
    try {
      await Api.delete(`/api/users/${customerToDelete.id}`);
      notifySuccess(t("Success.customerDeleted"));
      await fetchCustomers();
      setOpenDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
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
          <Stack direction={"row"} spacing={2}>
            <Stack direction={"row"}>
              <InputBase
                value={searchFilters.enName}
                onChange={(e) => {
                  setSearchFilters((prev) => ({
                    ...prev,
                    enName: e.target.value,
                  }));
                  setPage(1);
                }}
                placeholder={t("Customers.SearchName")}
                sx={{
                  color: "text.primary",
                  textAlign: "center",
                  width: "120px",
                }}
              />
            </Stack>
            <IconButton
              sx={{ color: "primary.main", padding: 0 }}
              onClick={handleSearch}
            >
              <Search />
            </IconButton>
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
              <StyledTableCell align="center">
                {t("Customers.ID")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.EnglishName")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.ArabicName")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.Role")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.Email")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.Phone")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.Points")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.Update")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {t("Customers.Delete")}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={9} align="center">
                  <CircularProgress />
                </StyledTableCell>
              </StyledTableRow>
            ) : !customers || customers.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={9} align="center">
                  {t("Customers.NoCustomers")}
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              customers.map((customer) => (
                <StyledTableRow key={customer.id}>
                  <StyledTableCell align="center">
                    {customer.id}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {customer.enName}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {customer.arName}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ 
                      color: customer.role === 'ADMIN' ? '#1976d2' : 'inherit',
                      fontWeight: customer.role === 'ADMIN' ? 'bold' : 'normal'
                    }}>
                      {customer.role}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {customer.email}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {customer.phone}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {customer.points}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box
                      sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                    >
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
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box
                      sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                    >
                      <IconButton size="small" color="error" onClick={() => {
                        setOpenDeleteModal(true);
                        setCustomerToDelete(customer);
                      }}>
                        <FaTrash />
                      </IconButton>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalPages * 10}
          page={page - 1}
          onPageChange={(e, newPage) => setPage(newPage + 1)}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
          labelRowsPerPage={t("Customers.RowsPerPage")}
        />
      </TableContainer>
      <AddCustomer
        open={openAddCustomer}
        onClose={() => setOpenAddCustomer(false)}
        isLoading={isLoadingAddCustomer}
        setIsLoading={setIsLoadingAddCustomer}
        fetchCustomers={fetchCustomers}
        customer={customer}
      />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDelete}
        title={t("Customers.DeleteCustomer")}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Customers;
