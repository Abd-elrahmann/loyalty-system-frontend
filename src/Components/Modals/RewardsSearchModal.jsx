import React, { useState } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const RewardsSearchModal = ({ open, onClose, onSearch }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
    type: "",
    minPoints: "",
  });

  const hasActiveFilters = filters.fromDate || filters.toDate || filters.type || filters.minPoints;

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      fromDate: null,
      toDate: null,
      type: "",
      minPoints: "",
    });
    onClose();
    setFilters({
      fromDate: null,
      toDate: null,
      type: "",
      minPoints: "",
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{...style, width: isMobile ? "90%" : 400}}>
        <Typography variant="h6" mb={2} textAlign={isMobile ? "center" : "left"}>
          {t("Rewards.SearchRewards")}
        </Typography>
        <Stack spacing={2}>
          <DatePicker
            label={t("Rewards.FromDate")}
            value={filters.fromDate}
            onChange={(newValue) =>
              setFilters({ ...filters, fromDate: newValue })
            }
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <DatePicker
            label={t("Rewards.ToDate")}
            value={filters.toDate}
            onChange={(newValue) => setFilters({ ...filters, toDate: newValue })}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <TextField
            select
            label={t("Rewards.Type")}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            fullWidth
          >
            <MenuItem value="cafe">{t("Rewards.Cafe")}</MenuItem>
            <MenuItem value="restaurant">{t("Rewards.Restaurant")}</MenuItem>
          </TextField>
          <TextField
            type="number"
            label={t("Rewards.MinPoints")}
            value={filters.minPoints}
            onChange={(e) =>
              setFilters({ ...filters, minPoints: e.target.value })
            }
            fullWidth
          />
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {}
            <Button variant="outlined" onClick={handleReset} disabled={!hasActiveFilters} size="small">
              {t("Rewards.Reset")}
              <CloseOutlined style={{marginLeft: '4px'}} />
            </Button>
            <Button variant="contained" onClick={handleSearch} size="small">
              {t("Rewards.Search")}
              <SearchOutlined style={{marginLeft: '4px'}} />
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default RewardsSearchModal;