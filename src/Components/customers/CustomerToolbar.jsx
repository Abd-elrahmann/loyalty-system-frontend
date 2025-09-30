import React from "react";
import {
  Box,
  Stack,
  InputBase,
  IconButton,
  Button,
} from "@mui/material";
import { SearchOutlined, QrcodeOutlined, DeleteOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";

const CustomerToolbar = ({
  searchValue,
  onSearchChange,
  onSearchClick,
  onScanQR,
  scannedEmail,
  onClearFilter,
  onAddCustomer,
  selectedCount,
  onBulkDelete,
  isLoading
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2 }, 
      mb: 2,
      width: '100%'
    }}>
      <Box
        sx={{
          display: "flex", 
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          width: '100%'
        }}
      >
        {/* الجزء الأيسر - البحث */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          width: { xs: "100%", sm: "auto" },
          order: { xs: 2, sm: 1 }
        }}>
          {isLoading ? (
            <Skeleton.Input 
              active 
              style={{ 
                width: "100%", 
                height: "40px", 
                borderRadius: "4px" 
              }} 
            />
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 1,
                flex: 1,
                maxWidth: { xs: '100%', sm: '300px' }
              }}>
                <InputBase
                  value={searchValue}
                  onChange={onSearchChange}
                  placeholder={t("Customers.SearchEmail")}
                  sx={{
                    color: "text.primary",
                    flex: 1,
                    py: 1
                  }}
                />
                <IconButton
                  sx={{ color: "primary.main" }}
                  onClick={onSearchClick}
                  size="small"
                >
                  <SearchOutlined />
                </IconButton>
              </Box>
              
              <IconButton
                sx={{ color: "primary.main" }}
                onClick={onScanQR}
                title={t("Customers.ScanQR")}
                size="small"
              >
                <QrcodeOutlined />
              </IconButton>

              {scannedEmail && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onClearFilter}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: "12px",
                  }}
                >
                  {t("Customers.ClearFilter")}
                </Button>
              )}
            </>
          )}
        </Box>
        
        {/* الجزء الأيمن - الأزرار */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          order: { xs: 1, sm: 2 }
        }}>
          {isLoading ? (
            <>
              <Skeleton.Button 
                active 
                style={{ 
                  width: "100px", 
                  height: "40px", 
                  borderRadius: "4px" 
                }} 
              />
              <Skeleton.Button 
                active 
                style={{ 
                  width: "140px", 
                  height: "40px", 
                  borderRadius: "4px" 
                }} 
              />
            </>
          ) : (
            <>
              {selectedCount > 0 && (
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
                  {t("Customers.Delete")} ({selectedCount})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAddCustomer}
                size="small"
                sx={{
                  whiteSpace: 'nowrap',
                  fontSize: "12px",
                  minWidth: 'auto'
                }}
              >
                {t("Customers.AddCustomer")}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerToolbar;