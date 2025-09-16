import React from "react";
import { Box, Button, Stack, TextField, Typography, MenuItem, Modal, useMediaQuery } from '@mui/material';
import { DatePicker } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';
const TransactionSearchModal = ({ open, onClose, onSearch }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    type: "",
    fromDate: null,
    toDate: null,
  });

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    onSearch(filters);
    onClose();
    setFilters({
      type: "",
      fromDate: null,
      toDate: null,
    });
    setLoading(false);
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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? '90%' : 400,
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
              <Button variant="outlined" onClick={handleReset} disabled={!filters.type && !filters.fromDate && !filters.toDate}>
                {t("Transactions.Reset")}
                <CloseOutlined style={{marginLeft: '4px'}} />
              </Button>
              <Button type="submit" variant="contained" disabled={!filters.type && !filters.fromDate && !filters.toDate} size="small">
                {loading ? <Spin size="large" /> : t("Transactions.Search")}
                <SearchOutlined style={{marginLeft: '4px'}} />
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default TransactionSearchModal;