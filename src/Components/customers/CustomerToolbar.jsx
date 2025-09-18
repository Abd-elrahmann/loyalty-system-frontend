import React from "react";
import {
  Box,
  Stack,
  InputBase,
  IconButton,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { SearchOutlined, FileExcelOutlined, FilePdfOutlined, QrcodeOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

const CustomerToolbar = ({
  searchValue,
  onSearchChange,
  onSearchClick,
  onScanQR,
  scannedEmail,
  onClearFilter,
  onExcelClick,
  excelAnchorEl,
  onExcelClose,
  onPdfClick,
  pdfAnchorEl,
  onPdfClose,
  onExportCSV,
  onExportPDF,
  onAddCustomer,
  isSmallMobile
}) => {
  const { t } = useTranslation();

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
          <InputBase
            value={searchValue}
            onChange={onSearchChange}
            placeholder={t("Customers.SearchEmail")}
            sx={{
              color: "text.primary",
              textAlign: "center",
              width: { xs: "100%", sm: "200px" },
              borderRadius: 1,
              px: 1,
            }}
          />
          <IconButton
            sx={{ color: "primary.main", padding: 0 }}
            onClick={onSearchClick}
          >
            <SearchOutlined  />
          </IconButton>
          <Stack direction="row" spacing={1}>
            <IconButton
              sx={{ color: "primary.main", padding: 0 }}
              onClick={onScanQR}
              title={t("Customers.ScanQR")}
            >
              <QrcodeOutlined />
            </IconButton>
            {scannedEmail && (
              <Button
                variant="text"
                onClick={onClearFilter}
                sx={{
                  width: isSmallMobile ? "100px" : "auto",
                  fontSize: "12px",
                }}
              >
                {t("Customers.ClearFilter")}
              </Button>
            )}
          </Stack>
        </Stack>
        
        <Stack direction="row" spacing={1} sx={{ 
          mt: { xs: 2, sm: 0 },
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1
        }}>
          <Button
            variant="outlined"
            startIcon={<FileExcelOutlined />}
            onClick={onExcelClick}
            sx={{
              width: { xs: "100%", sm: "auto" },
              height: { xs: "40px", sm: "40px" },
              fontSize: "12px",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            {t("Customers.ExportCSV")}
          </Button>
          <Menu
            anchorEl={excelAnchorEl}
            open={Boolean(excelAnchorEl)}
            onClose={onExcelClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                minWidth: '200px',
              }
            }}
          >
            <MenuItem onClick={() => onExportCSV(false)}>{t("Customers.CurrentPage")}</MenuItem>
            <MenuItem onClick={() => onExportCSV(true)}>{t("Customers.AllPages")}</MenuItem>
          </Menu>

          <Button
            variant="outlined"
            startIcon={<FilePdfOutlined />}
            onClick={onPdfClick}
            sx={{
              width: { xs: "100%", sm: "auto" },
              height: { xs: "40px", sm: "40px" },
              fontSize: "12px",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            {t("Customers.ExportPDF")}
          </Button>
          <Menu
            anchorEl={pdfAnchorEl}
            open={Boolean(pdfAnchorEl)}
            onClose={onPdfClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                minWidth: '200px',
              }
            }}
          >
            <MenuItem onClick={() => onExportPDF(false)}>{t("Customers.CurrentPage")}</MenuItem>
            <MenuItem onClick={() => onExportPDF(true)}>{t("Customers.AllPages")}</MenuItem>
          </Menu>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddCustomer}
            sx={{
              width: { xs: "100%", sm: "auto" },
              height: { xs: "40px", sm: "40px" },
              fontSize: "12px",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            {t("Customers.AddCustomer")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CustomerToolbar;