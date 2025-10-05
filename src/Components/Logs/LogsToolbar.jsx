import React, { useCallback, useRef } from "react";
import {
  Box,
  Stack,
  InputBase,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { RestartAltOutlined } from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import { Skeleton } from "antd";
import { debounce } from 'lodash';
import { useTranslation } from "react-i18next";
const LogsToolbar = ({
  filters,
  onFilterChange,
  onResetFilters,
  isMobile,
  isLoading,
}) => {
  const {
    table,
    screen,
    userName,
    fromDate,
    toDate,
  } = filters;

  const searchInputRef = useRef(null);
  const { t } = useTranslation();
  const handleActionChange = (event) => {
    onFilterChange('table', event.target.value);
  };

  const handleScreenChange = (event) => {
    onFilterChange('screen', event.target.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      onFilterChange('userName', value);
    }, 600),
    []
  );

  const handleUserNameChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleFromDateChange = (newValue) => {
    onFilterChange('fromDate', newValue ? dayjs(newValue) : null);
  };

  const handleToDateChange = (newValue) => {
    onFilterChange('toDate', newValue ? dayjs(newValue) : null);
  };

  const handleReset = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onResetFilters();
  };

  // Check if any filters are active
  const hasActiveFilters = table || screen || userName || fromDate || toDate;

  return (
    <Stack 
      direction="row" 
      alignItems="center" 
      justifyContent={{ xs: "center", md: "space-between" }} 
      spacing={2} 
      sx={{ marginBottom: 2, mt: 4 }}
    >
      <Stack 
        sx={{ 
          flexDirection: { xs: "column", md: "row" }, 
          width: "100%" 
        }} 
        justifyContent="space-between" 
        gap={2}
      >
        <Stack 
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          {isLoading ? (
            <>
              <Skeleton.Input 
                active 
                style={{ 
                  width: isMobile ? "100%" : "200px",
                  height: "40px",
                  borderRadius: "4px"
                }} 
              />
              <Skeleton.Input 
                active 
                style={{ 
                  width: "150px",
                  height: "40px", 
                  borderRadius: "4px"
                }} 
              />
              <Skeleton.Input 
                active 
                style={{ 
                  width: "150px",
                  height: "40px",
                  borderRadius: "4px"
                }} 
              />
            </>
          ) : (
            <>
              <InputBase
                inputRef={searchInputRef}
                defaultValue={userName || ""}
                onChange={handleUserNameChange}
                placeholder={t("Logs.SearchByUserName")}
                autoFocus
                sx={{ 
                  width: isMobile ? "100%" : "200px",
                  padding: "4px 12px",
                  fontSize: "16px",
                }}
              />

              <FormControl sx={{ minWidth: 150, maxWidth: "200px" }} size="small">
                <InputLabel>{t("Logs.ActionType")}</InputLabel>
                <Select
                  value={table || ""}
                  onChange={handleActionChange}
                  label={t("Logs.ActionType")}
                >
                  <MenuItem value="Login">{t("Logs.Login")}</MenuItem>
                  <MenuItem value="Create">{t("Logs.Create")}</MenuItem>
                  <MenuItem value="Update">{t("Logs.Update")}</MenuItem>
                  <MenuItem value="Delete">{t("Logs.Delete")}</MenuItem>
                </Select>
              </FormControl>

              <FormControl 
                sx={{ 
                  minWidth: 150, 
                  maxWidth: "200px",
                  maxHeight: "200px",
                  overflowY: "scroll",
                }} 
                size="small"
              >
                <InputLabel>{t("Logs.Screen")}</InputLabel>
                <Select
                  value={screen || ""}
                  onChange={handleScreenChange}
                  label={t("Logs.Screen")}
                >
                  <MenuItem value="login">{t("Logs.Login")}</MenuItem>
                  <MenuItem value="managers">{t("Logs.Managers")}</MenuItem>
                  <MenuItem value="pos">{t("Logs.PointOfSale")}</MenuItem>
                  <MenuItem value="redeem">{t("Logs.Redeem")}</MenuItem>
                  <MenuItem value="invoices">{t("Logs.Invoices")}</MenuItem>
                  <MenuItem value="customers">{t("Logs.Customers")}</MenuItem>
                  <MenuItem value="products">{t("Logs.Products")}</MenuItem>
                  <MenuItem value="transactions">{t("Logs.Transactions")}</MenuItem>
                  <MenuItem value="rewards">{t("Logs.Rewards")}</MenuItem>
                  <MenuItem value="settings">{t("Logs.Settings")}</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Stack>

        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          justifyContent="flex-end"
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          {isLoading ? (
            <>
              <Skeleton.Input 
                active 
                style={{ 
                  width: "150px",
                  height: "40px",
                  borderRadius: "4px"
                }} 
              />
              <Skeleton.Input 
                active 
                style={{ 
                  width: "150px",
                  height: "40px",
                  borderRadius: "4px"
                }} 
              />
              <Skeleton.Button 
                active 
                style={{ 
                  width: "40px",
                  height: "40px",
                  borderRadius: "4px"
                }} 
              />
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label={t("Logs.FromDate")}
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={handleFromDateChange}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                    } 
                  }}
                  format="YYYY-MM-DD"
                />
                <DatePicker
                  label={t("Logs.ToDate")}
                  value={toDate ? dayjs(toDate) : null}
                  onChange={handleToDateChange}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                    } 
                  }}
                  format="YYYY-MM-DD"
                />  
              </Box>
              {hasActiveFilters && (
                <IconButton
                  onClick={handleReset}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <RestartAltOutlined style={{ color: "primary.main" }} />
                </IconButton>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LogsToolbar;