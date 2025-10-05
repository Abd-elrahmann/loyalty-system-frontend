import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TextField,
  useTheme,
  useMediaQuery,
  TableSortLabel,
} from "@mui/material";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyledTableCell, StyledTableRow } from "../Shared/tableLayout";
import { useTranslation } from "react-i18next";
import { Search, RestartAltOutlined, Visibility } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import Api from "../../Config/Api";
import dayjs from "dayjs";
import debounce from "lodash.debounce";
import { Spin } from "antd";
import { DatePicker } from "@mui/x-date-pickers";
import InvoiceCard from "./InvoiceCard";
import { useCurrencyManager } from "../../Config/globalCurrencyManager";

const InvoiceSearch = ({ onViewInvoice }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { formatAmount } = useCurrencyManager();
  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    phone: "",
    email: "",
  });

  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [emailInputValue, setEmailInputValue] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  
  // Get initial sort values from localStorage
  const [orderBy, setOrderBy] = useState(() => 
    localStorage.getItem('invoice_search_sort_orderBy') || "id"
  );
  const [order, setOrder] = useState(() => 
    localStorage.getItem('invoice_search_sort_order') || "asc"
  );

  // Save sort state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoice_search_sort_orderBy', orderBy);
    localStorage.setItem('invoice_search_sort_order', order);
  }, [orderBy, order]);

  const closepopup = () => {
    setOpen(false);
    setPage(1);
    setSearchTriggered(false);
  };

  const showpopup = () => {
    setOpen(true);
    setSearchTriggered(true);
  };

  const buildQueryParams = useCallback((searchParams = {}) => {
    const baseParams = {
      limit: 10,
      fromDate: formData.fromDate ? dayjs(formData.fromDate).format("YYYY-MM-DD") : undefined,
      toDate: formData.toDate ? dayjs(formData.toDate).format("YYYY-MM-DD") : undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      sortBy: orderBy,
      sortOrder: order,
      ...searchParams,
    };

    return Object.keys(baseParams)
      .filter(key => baseParams[key] !== undefined && baseParams[key] !== "")
      .map(key => `${key}=${encodeURIComponent(baseParams[key])}`)
      .join("&");
  }, [formData, orderBy, order]);

  const getAllData = useCallback(async (searchParams = {}) => {
    setLoading(true);
    try {
      const queryString = buildQueryParams(searchParams);
      const url = `/api/invoices/all/${page}${queryString ? `?${queryString}` : ""}`;
      console.log('Invoice Search API Call:', { url, searchParams });
      
      const res = await Api.get(url);
      setData(res.data.data || []);
      setCount(res.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setData([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, buildQueryParams]);

  const debouncedSearch = useMemo(
    () => debounce((searchParams) => getAllData(searchParams), 500),
    [getAllData]
  );

  const handleSort = useCallback((property) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrderBy(property);
    setOrder(newOrder);
    setPage(1);
    setSearchTriggered(true);
  }, [orderBy, order]);

  const handleClearFilter = useCallback(() => {
    setFormData({
      fromDate: null,
      toDate: null,
      phone: "",
      email: "",
    });
    setPhoneInputValue("");
    setEmailInputValue("");
    setPage(1);
    setSearchTriggered(true);
    setOrderBy("id");
    setOrder("asc");
  }, []);

  const handleViewInvoice = useCallback(async (invoiceId) => {
    try {
      const response = await Api.get(`/api/invoices/${invoiceId}`);
      onViewInvoice(response.data);
      closepopup();
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  }, [onViewInvoice]);

  const handleInputChange = useCallback((field, value) => {
    if (field === 'phone') setPhoneInputValue(value);
    if (field === 'email') setEmailInputValue(value);
    
    setFormData(prev => ({ ...prev, [field]: value }));
    setSearchTriggered(true);
    setPage(1);
    debouncedSearch({ [field]: value, sortBy: orderBy, sortOrder: order });
  }, [orderBy, order, debouncedSearch]);

  const handleDateChange = useCallback((date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    setSearchTriggered(true);
    setPage(1);
    debouncedSearch({
      [field]: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
      sortBy: orderBy,
      sortOrder: order,
    });
  }, [orderBy, order, debouncedSearch]);

  // Fetch data when necessary conditions are met
  useEffect(() => {
    if (open && searchTriggered) {
      getAllData();
    }
  }, [open, searchTriggered, page, orderBy, order, getAllData]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div>
      <Button
        onClick={showpopup}
        variant="outlined"
        sx={{ gap: "3px" }}
        startIcon={<Search />}
      >
        {t("Invoice.InvoiceSearch")}
      </Button>
      <Dialog open={open} onClose={closepopup} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("Invoice.InvoiceSearch")}
          <IconButton onClick={closepopup}>
            <CloseIcon color="primary" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                padding: "20px 0",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <TextField
                sx={{ width: { md: "20%", sm: "30%", xs: "45%" } }}
                label={t("Invoice.Phone")}
                name="phone"
                value={phoneInputValue}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t("Invoice.PhonePlaceholder")}
              />

              <TextField
                sx={{ width: { md: "20%", sm: "30%", xs: "45%" } }}
                label={t("Invoice.Email")}
                name="email"
                value={emailInputValue}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t("Invoice.EmailPlaceholder")}
              />

              <DatePicker
                format="DD/MM/YYYY"
                label={t("Invoice.FromDate")}
                value={formData.fromDate}
                onChange={(date) => handleDateChange(date, "fromDate")}
                sx={{ width: { md: "20%", sm: "30%", xs: "45%" } }}
              />

              <DatePicker
                format="DD/MM/YYYY"
                label={t("Invoice.ToDate")}
                value={formData.toDate}
                onChange={(date) => handleDateChange(date, "toDate")}
                sx={{ width: { md: "20%", sm: "30%", xs: "45%" } }}
              />

              <Box
                sx={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <IconButton
                  sx={{ color: "background.default" }}
                  onClick={() => setSearchTriggered(true)}
                  title={t("Invoice.SearchNow")}
                >
                  <Search />
                </IconButton>

                <IconButton
                  onClick={handleClearFilter}
                  sx={{ color: "background.default" }}
                  title={t("Invoice.ClearFilters")}
                >
                  <RestartAltOutlined />
                </IconButton>
              </Box>
            </Box>

            <Box
              sx={{
                overflow: "auto",
                minHeight: "500px",
                position: "relative",
              }}
            >
              {isLoading ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Spin size="large" />
                </Box>
              ) : !searchTriggered ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  {t("Invoice.EnterSearchCriteria")}
                </Box>
              ) : !data || data.length === 0 ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  {t("Invoice.NoInvoicesFound")}
                </Box>
              ) : isMobile ? (
                <Box sx={{ p: 1 }}>
                  {data.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onViewInvoice={handleViewInvoice}
                      t={t}
                      orderBy={orderBy}
                      order={order}
                      handleSort={handleSort}
                    />
                  ))}
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "id"}
                          direction={orderBy === "id" ? order : "asc"}
                          onClick={() => handleSort("id")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.ID")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "user.name"}
                          direction={orderBy === "user.name" ? order : "asc"}
                          onClick={() => handleSort("user.name")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.Customer")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "phone"}
                          direction={orderBy === "phone" ? order : "asc"}
                          onClick={() => handleSort("phone")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.Phone")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "email"}
                          direction={orderBy === "email" ? order : "asc"}
                          onClick={() => handleSort("email")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.Email")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "totalPrice"}
                          direction={orderBy === "totalPrice" ? order : "asc"}
                          onClick={() => handleSort("totalPrice")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.Total")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "points"}
                          direction={orderBy === "points" ? order : "asc"}
                          onClick={() => handleSort("points")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.Points")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <TableSortLabel
                          active={orderBy === "createdAt"}
                          direction={orderBy === "createdAt" ? order : "asc"}
                          onClick={() => handleSort("createdAt")}
                          sx={{ color: "white !important" }}
                        >
                          {t("Invoice.Date")}
                        </TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Actions")}
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((invoice) => (
                      <StyledTableRow key={invoice.id}>
                        <StyledTableCell align="center">
                          {invoice.id}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {invoice.user
                            ? localStorage.getItem("i18nextLng") === "ar"
                              ? invoice.user.arName
                              : invoice.user.enName
                            : t("Invoice.guest")}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {invoice.phone || "-"}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {invoice.email || "-"}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {formatAmount(invoice.totalPrice, invoice.currency)}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {invoice.points}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {dayjs(invoice.createdAt).format("DD/MM/YYYY hh:mm A")}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Button
                            onClick={() => handleViewInvoice(invoice.id)}
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                          >
                            {t("Invoice.ViewInvoice")}
                          </Button>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>

            {searchTriggered && data && data.length > 0 && (
              <Stack
                direction="row"
                sx={{ margin: "10px 0" }}
                gap={2}
                justifyContent={"center"}
              >
                <Pagination
                  count={count}
                  page={page}
                  onChange={(e, value) => {
                    setPage(value);
                    setSearchTriggered(true);
                  }}
                  color="primary"
                />
                <IconButton
                  sx={{ color: "background.default" }}
                  onClick={handleClearFilter}
                  title={t("Invoice.ClearFilters")}
                >
                  <RestartAltOutlined />
                </IconButton>
              </Stack>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceSearch;
