import React from "react";
import {
  Box,
  Stack,
  InputBase,
  IconButton,
  Button,
} from "@mui/material";
import { SearchOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

const ManagersToolbar = ({
  searchValue,
  onSearchChange,
  onSearchClick,
  onClearFilter,
  onAddManager,
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
            placeholder={t("Mangers.Search")}
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
          {searchValue && (
            <Button
              variant="text"
              onClick={onClearFilter}
              sx={{
                width: isSmallMobile ? "100px" : "auto",
                fontSize: "12px",
              }}
            >
              {t("Mangers.ClearFilter")}
            </Button>
          )}
        </Stack>
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddManager}
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
          {t("Mangers.AddManager")}
        </Button>
      </Box>
    </Box>
  );
};

export default ManagersToolbar;