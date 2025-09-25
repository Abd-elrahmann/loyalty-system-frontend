import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Card,
  CardContent,
  alpha,
  useTheme,
  Grid,
  IconButton,
  useMediaQuery,
  Stack,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import InvoiceSearch from "../Components/Modals/InvoiceSearch";
import {
  RestartAltOutlined,
  ReceiptLongOutlined,
  PersonOutlined,
  PhoneOutlined,
  EmailOutlined,
  ReceiptOutlined,
  CalendarTodayOutlined,
  PaidOutlined,
  LocalOfferOutlined,
  StarsOutlined,
} from "@mui/icons-material";
import {
  useCurrencyManager,
  formatCurrency,
} from "../Config/globalCurrencyManager";

const Invoice = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const { formatAmount } = useCurrencyManager();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  const handleViewInvoice = (invoiceData) => {
    setSelectedInvoice(invoiceData);

    if (invoiceData.items) {
      setInvoiceItems(invoiceData.items);
    }
  };

  const handleClearInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceItems([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          gap: 2,
          mb: 4,
        }}
      >
        <InvoiceSearch onViewInvoice={handleViewInvoice} />
        {selectedInvoice && (
          <IconButton
            onClick={handleClearInvoice}
            sx={{
              border: `2px solid ${theme.palette.primary.main}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <RestartAltOutlined sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        )}
      </Box>

      {selectedInvoice ? (
        <Box>
          <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t("Invoice.customerInfo")}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                <TextField
                  label={t("Invoice.name")}
                  sx={{ flex: 1, minWidth: "300px" }}
                  value={
                    selectedInvoice.user
                      ? i18n.language === "ar"
                        ? selectedInvoice.user.arName
                        : selectedInvoice.user.enName
                      : t("Invoice.guest")
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  fullWidth
                />

                <TextField
                  label={t("Invoice.phone")}
                  value={selectedInvoice.phone || t("Invoice.notProvided")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  fullWidth
                />

                <TextField
                  label={t("Invoice.email")}
                  sx={{ flex: 1, minWidth: "300px" }}
                  value={selectedInvoice.email || t("Invoice.notProvided")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Stack>
            </Box>

            <Box sx={{ width: "100%" }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t("Invoice.invoiceDetails")}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{ flexWrap: "wrap", gap: 2 }}
              >
                <TextField
                  label={t("Invoice.invoiceNumber")}
                  value={`#${selectedInvoice.id}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptOutlined
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  sx={{ flex: 1, minWidth: "200px" }}
                />

                <TextField
                  label={t("Invoice.date")}
                  value={selectedInvoice.formattedDate}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayOutlined
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  sx={{ flex: 1, minWidth: "240px" }}
                />

                <TextField
                  label={t("Invoice.totalPrice")}
                  value={`${selectedInvoice.totalPrice} ${i18n.language === "ar" ? selectedInvoice.currency === "USD" ? "دولار امريكي" : "دينار عراقي" : selectedInvoice.currency}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaidOutlined
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  sx={{ flex: 1, minWidth: "200px" }}
                />

                {selectedInvoice.discount > 0 && (
                  <TextField
                    label={t("Invoice.discount")}
                    value={`${selectedInvoice.discount}%`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferOutlined
                            sx={{ color: theme.palette.error.main }}
                          />
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                    sx={{ flex: 1, minWidth: "200px" }}
                  />
                )}

                <TextField
                  label={t("Invoice.pointsEarned")}
                  value={`${selectedInvoice.points} ${t("Invoice.points")}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarsOutlined
                          sx={{ color: theme.palette.success.main }}
                        />
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  sx={{ flex: 1, minWidth: "200px" }}
                />
              </Stack>
            </Box>

            <Box sx={{ mt: 4, width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ReceiptLongOutlined
                  sx={{ color: theme.palette.primary.main }}
                />
                {t("Invoice.items")}
              </Typography>

              {invoiceItems.length > 0 ? (
                isMobile ? (
                  <Stack spacing={2}>
                    {invoiceItems.map((item, index) => {
                      const product =
                        item.cafeProduct || item.restaurantProduct;
                      const productType = item.cafeProduct
                        ? "Cafe"
                        : "Restaurant";

                      return (
                        <Card key={index} sx={{ p: 2 }}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {product
                                ? i18n.language === "ar"
                                  ? product.arName
                                  : product.enName
                                : "N/A"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography color="text.secondary">
                                {t("Invoice.type")}:
                              </Typography>
                              <Typography>
                                {t(`Invoice.${productType.toLowerCase()}`)}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography color="text.secondary">
                                {t("Invoice.price")}:
                              </Typography>
                              <Typography>{formatPrice(item.price)}</Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography color="text.secondary">
                                {t("Invoice.quantity")}:
                              </Typography>
                              <Typography>{item.quantity}</Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography color="text.secondary">
                                {t("Invoice.total")}:
                              </Typography>
                              <Typography color="primary.main" fontWeight={600}>
                                {formatPrice(item.total)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer
                    component={Paper}
                    sx={{
                      borderRadius: 2,
                      boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell sx={{ fontWeight: 600 }}>
                            {t("Invoice.product")}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("Invoice.type")}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("Invoice.price")}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("Invoice.quantity")}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("Invoice.total")}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("Invoice.PriceAfterDiscount")}
                          </StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {invoiceItems.map((item, index) => {
                          const product =
                            item.cafeProduct || item.restaurantProduct;
                          const productType = item.cafeProduct
                            ? "Cafe"
                            : "Restaurant";

                          return (
                            <StyledTableRow
                              key={index}
                              sx={{
                                "&:nth-of-type(odd)": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.light,
                                    0.05
                                  ),
                                },
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.light,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <StyledTableCell>
                                {product
                                  ? i18n.language === "ar"
                                    ? product.arName
                                    : product.enName
                                  : "N/A"}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Box
                                  sx={{
                                    display: "inline-block",
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: item.cafeProduct
                                      ? alpha(theme.palette.info.main, 0.1)
                                      : alpha(theme.palette.warning.main, 0.1),
                                    color: item.cafeProduct
                                      ? theme.palette.info.main
                                      : theme.palette.warning.main,
                                  }}
                                >
                                  {t(`Invoice.${productType.toLowerCase()}`)}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {`${item.price} ${
                                  selectedInvoice.currency === "USD"
                                    ? "$"
                                    : selectedInvoice.currency === "IQD"
                                    ? "د.ع"
                                    : selectedInvoice.currency
                                }`}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {item.quantity}
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{
                                  fontWeight: 600,
                                  color:
                                    item.total > 100
                                      ? "error.main"
                                      : "primary.main",
                                  textDecoration: "line-through",
                                }}
                              >
                                {`${item.total} ${
                                  selectedInvoice.currency === "USD"
                                    ? "$"
                                    : selectedInvoice.currency === "IQD"
                                    ? "د.ع"
                                    : selectedInvoice.currency
                                }`}
                              </StyledTableCell>
                              <StyledTableCell align="center" sx={{
                                  fontWeight: 600,
                                  color:
                                    item.total > 100
                                      ? "error.main"
                                      : "primary.main",
                                }}>
                                {`${
                                  item.total -
                                  item.total * (selectedInvoice.discount / 100)
                                } ${
                                  selectedInvoice.currency === "USD"
                                    ? "$"
                                    : selectedInvoice.currency === "IQD"
                                    ? "د.ع"
                                    : selectedInvoice.currency
                                }`}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Paper
                  sx={{
                    textAlign: "center",
                    py: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    border: `1px dashed ${theme.palette.primary.light}`,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {t("Invoice.noItemsAvailable")}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
          }}
        >
          <ReceiptLongOutlined
            sx={{
              fontSize: 80,
              color: alpha(theme.palette.primary.main, 0.3),
              mb: 3,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            {t("Invoice.noInvoiceSelected")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {t("Invoice.searchHint")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Invoice;
