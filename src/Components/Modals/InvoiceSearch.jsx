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
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
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

  const closepopup = () => {
    setOpen(false);
    setPage(1);
    setSearchTriggered(false);
  };

  const showpopup = () => {
    setOpen(true);
    setSearchTriggered(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchParams) => {
      getAllData(searchParams);
    }, 500),
    []
  );

  const searchSubmit = () => {
    setSearchTriggered(true);
    setPage(1);
    getAllData();
  };

  const handleClearFilter = () => {
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
    getAllData();
  };

  const getAllData = async (searchParams = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        limit: 10,
        fromDate: formData.fromDate
          ? dayjs(formData.fromDate).format("YYYY-MM-DD")
          : undefined,
        toDate: formData.toDate
          ? dayjs(formData.toDate).format("YYYY-MM-DD")
          : undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        ...searchParams,
      };

      const queryString = Object.keys(queryParams)
        .filter(
          (key) => queryParams[key] !== undefined && queryParams[key] !== ""
        )
        .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
        .join("&");

      const url = `/api/invoices/all/${page}${queryString ? `?${queryString}` : ""}`;
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
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const response = await Api.get(`/api/invoices/${invoiceId}`);
      onViewInvoice(response.data);
      closepopup();
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneInputValue(value);
    setFormData((prev) => ({ ...prev, phone: value }));
    setSearchTriggered(true);
    setPage(1);
    debouncedSearch({ phone: value });
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailInputValue(value);
    setFormData((prev) => ({ ...prev, email: value }));
    setSearchTriggered(true);
    setPage(1);
    debouncedSearch({ email: value });
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    setSearchTriggered(true);
    setPage(1);
    debouncedSearch({
      [field]: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
    });
  };

  useEffect(() => {
    if (open && searchTriggered) {
      getAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, open, searchTriggered]);

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
        sx={{
          gap: "3px",
        }}
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
                onChange={handlePhoneChange}
                placeholder={t("Invoice.PhonePlaceholder")}
              />

              <TextField
                sx={{ width: { md: "20%", sm: "30%", xs: "45%" } }}
                label={t("Invoice.Email")}
                name="email"
                value={emailInputValue}
                onChange={handleEmailChange}
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
                  onClick={searchSubmit}
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
                    />
                  ))}
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center">
                        {t("Invoice.ID")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Customer")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Phone")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Email")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Total")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Points")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {t("Invoice.Date")}
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
                          {dayjs(invoice.createdAt).format("DD/MM/YYYY HH:mm a")}
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
              </Stack>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceSearch;
