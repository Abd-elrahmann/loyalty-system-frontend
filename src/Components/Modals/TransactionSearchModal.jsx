import React from "react";
import {
  Modal,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";
const TransactionSearchModal = ({ open, onClose, onSearch }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState({
    type: "",
    fromDate: null,
    toDate: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      type: "",
      fromDate: null,
      toDate: null,
    });
    onSearch({
      type: "",
      fromDate: null,
      toDate: null,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" mb={3}>
          {t("Transactions.SearchTransactions")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              select
              label={t("Transactions.Type")}
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="earn">{t("Transactions.Earn")}</MenuItem>
              <MenuItem value="redeem">{t("Transactions.Redeem")}</MenuItem>
            </TextField>

            <DatePicker
              label={t("Transactions.FromDate")}
              value={filters.fromDate}
              onChange={(date) => setFilters({ ...filters, fromDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <DatePicker
              label={t("Transactions.ToDate")}
              value={filters.toDate}
              onChange={(date) => setFilters({ ...filters, toDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
              minDate={filters.fromDate}
            />

            <Stack direction="row"  justifyContent="space-between">
              <Button variant="outlined" onClick={handleReset}>
                {t("Transactions.Reset")}
              </Button>
              <Button type="submit" variant="contained">
                {t("Transactions.Search")}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default TransactionSearchModal;