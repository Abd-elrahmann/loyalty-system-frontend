import React, { useState, useEffect } from "react";
import {
  useMediaQuery,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import LogsToolbar from "../../Components/Logs/LogsToolbar";
import LogsTable from "../../Components/Logs/LogsTable";

import { logsApi, logsKeys } from "./logsApi";

const Logs = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    table: "",
    screen: "",
    userName: "",
    fromDate: null,
    toDate: null,
  });

  const buildQueryParams = () => {
    const params = {
      limit: rowsPerPage,
    };

    if (filters.table) {
      params.table = filters.table;
    }

    if (filters.screen) {
      params.screen = filters.screen;
    }

    if (filters.userName) {
      params.userName = filters.userName;
    }

    if (filters.fromDate) {
      params.fromDate = dayjs(filters.fromDate).startOf('day').format('YYYY-MM-DD');
    }

    if (filters.toDate) {
      params.toDate = dayjs(filters.toDate).endOf('day').format('YYYY-MM-DD');
    }

    return params;
  };

  const {
    data: logsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: logsKeys.list({ page, rowsPerPage, ...filters }),
    queryFn: () => logsApi.getLogs(page, buildQueryParams()),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      table: "",
      screen: "",
      userName: "",
      fromDate: null,
      toDate: null,
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  useEffect(() => {
    refetch();
  }, [filters, page, rowsPerPage, refetch]);

  return (
    <>
      <Helmet>
        <title>System Logs</title>
        <meta name="description" content="System activity logs and audit trail" />
      </Helmet>
    
        <LogsToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isMobile={isMobile}
          isLoading={isLoading}
        />

        <LogsTable
          logsData={logsData}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
    </>
  );
};

export default Logs;