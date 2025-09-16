import React from 'react';
import {
  Button,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

const RewardsExportButtons = ({
  exportToCSV,
  exportToPDF,
  PrintRewards,
  isMobile
}) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      spacing={2}
      sx={{ mt: isMobile ? 2 : 0 }}
      alignItems="center"
    >
      <Button variant="outlined" onClick={exportToCSV} sx={{ height: "40px", width: isMobile ? "140px" : "135px",fontSize: "12px",
        "&:hover": {
          backgroundColor: "primary.main",
          color: "white",
        },
      }}>
        <FileExcelOutlined style={{marginRight: '4px'}} />
        {t("Rewards.ExportExcel")}
      </Button>
      <Button variant="outlined" onClick={exportToPDF} sx={{ height: "40px", width: isMobile ? "140px" : "135px",fontSize: "12px",
        "&:hover": {
          backgroundColor: "primary.main",
          color: "white",
        },
      }}>
        <FilePdfOutlined style={{marginRight: '4px'}} />
        {t("Rewards.ExportPdf")}
      </Button>
      <Button variant="outlined" onClick={PrintRewards} sx={{ height: "40px", width: isMobile ? "140px" : "135px",fontSize: "12px",
        "&:hover": {
          backgroundColor: "primary.main",
          color: "white",
        },
      }}>
        <PrinterOutlined style={{marginRight: '4px'}} />
        {t("Rewards.Print")}
      </Button>
    </Stack>
  );
};

export default RewardsExportButtons;