import React from "react";
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
    dateRange,
  } = filters;

  const handleActionChange = (event) => {
    onFilterChange('table', event.target.value);
  };

  const handleScreenChange = (event) => {
    onFilterChange('screen', event.target.value);
  };

  const handleUserNameChange = (event) => {
    onFilterChange('userName', event.target.value);
  };

  const handleDateRangeChange = (dates) => {
    onFilterChange('dateRange', dates);
  };

  const hasActiveFilters = table || screen || userName || (dateRange && dateRange.length === 2);

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
                value={userName || ""}
                onChange={(e) => handleUserNameChange(e)}
                placeholder="Search by user name..."
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
                  label="Start Date"
                  value={dateRange ? dayjs(dateRange[0]) : null}
                  onChange={(newValue) => {
                    const endDate = dateRange?.[1] ? dayjs(dateRange[1]) : null;
                    handleDateRangeChange([newValue, endDate]);
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange ? dayjs(dateRange[1]) : null}
                  onChange={(newValue) => {
                    const startDate = dateRange?.[0] ? dayjs(dateRange[0]) : null;
                    handleDateRangeChange([startDate, newValue]);
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>
              {hasActiveFilters && (
                <IconButton
                  onClick={onResetFilters}
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