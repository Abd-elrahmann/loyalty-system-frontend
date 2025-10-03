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
                placeholder="Search by user name..."
                autoFocus
                sx={{ 
                  width: isMobile ? "100%" : "200px",
                  padding: "4px 12px",
                  fontSize: "16px",
                }}
              />

              <FormControl sx={{ minWidth: 150, maxWidth: "200px" }} size="small">
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={table || ""}
                  onChange={handleActionChange}
                  label="Action Type"
                >
                  <MenuItem value="Login">Login</MenuItem>
                  <MenuItem value="Create">Create</MenuItem>
                  <MenuItem value="Update">Update</MenuItem>
                  <MenuItem value="Delete">Delete</MenuItem>
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
                <InputLabel>Screen</InputLabel>
                <Select
                  value={screen || ""}
                  onChange={handleScreenChange}
                  label="Screen"
                >
                  <MenuItem value="dashboard">Dashboard</MenuItem>
                  <MenuItem value="managers">Managers</MenuItem>
                  <MenuItem value="pos">Point of Sale</MenuItem>
                  <MenuItem value="invoices">Invoices</MenuItem>
                  <MenuItem value="customers">Customers</MenuItem>
                  <MenuItem value="products">Products</MenuItem>
                  <MenuItem value="transactions">Transactions</MenuItem>
                  <MenuItem value="reports">Reports</MenuItem>
                  <MenuItem value="rewards">Rewards</MenuItem>
                  <MenuItem value="settings">Settings</MenuItem>
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
                  label="From Date"
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
                  label="To Date"
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
                  <RestartAltOutlined style={{ color: "red" }} />
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