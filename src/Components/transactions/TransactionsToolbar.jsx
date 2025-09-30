import React from "react";
import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { RestartAltOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";

const TransactionsToolbar = ({
  customerId,
  filters,
  onSearch,
  onResetFilters,
  selectedCount,
  onBulkDelete,
  isLoading
}) => {
  const { t } = useTranslation();

  const hasActiveFilters = filters.type || filters.fromDate || filters.toDate;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Stack direction={"row"} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          {!customerId && (
            <>
              {isLoading ? (
                <>
                  <Skeleton.Button 
                    active 
                    style={{ 
                      width: "120px", 
                      height: "40px", 
                      borderRadius: "4px" 
                    }} 
                  />
                  {hasActiveFilters && (
                    <Skeleton.Button 
                      active 
                      style={{ 
                        width: "100px", 
                        height: "40px", 
                        borderRadius: "4px" 
                      }} 
                    />
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={onSearch}
                    sx={{
                      color: "#800080",
                      textAlign: "center",
                      fontSize: { xs: "12px", sm: "14px" },
                      width: { xs: "100%", sm: "auto" },
                      height: "40px",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    <SearchOutlined style={{ fontSize: "16px", marginRight: "8px" }} />
                    {t("Transactions.Search")}
                  </Button>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      onClick={onResetFilters}
                      sx={{ 
                        width: { xs: "100%", sm: "auto" },
                        height: "40px",
                        fontSize: { xs: "12px", sm: "14px" },
                        textAlign: "center",
                      }}
                    >
                      <RestartAltOutlined sx={{ mr: 1 }} />
                      {t("Transactions.Reset")}
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ 
          mt: { xs: 2, sm: 0 },
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          width: { xs: "100%", sm: "auto" }
        }}>
          {isLoading ? (
            <Skeleton.Button 
              active 
              style={{ 
                width: "140px", 
                height: "40px", 
                borderRadius: "4px" 
              }} 
            />
          ) : (
            selectedCount > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlined />}
                onClick={onBulkDelete}
                size="small"
                sx={{
                  whiteSpace: 'nowrap',
                  fontSize: "12px",
                }}
              >
                {t("Transactions.Delete")} ({selectedCount})
              </Button>
            )
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default TransactionsToolbar;