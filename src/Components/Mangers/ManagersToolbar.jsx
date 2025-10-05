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
import { Skeleton } from "antd";

const ManagersToolbar = ({
  searchValue,
  onSearchChange,
  onSearchClick,
  onClearFilter,
  onAddManager,
  isSmallMobile,
  isLoading
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
          {isLoading ? (
            <Skeleton.Input active style={{ width: "100%", height: "40px", borderRadius: "10px" }} />
          ) : (
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
          )}
          <IconButton
            sx={{ color: "primary.main", padding: 0 }}
            onClick={onSearchClick}
          >
            {isLoading ? (
              <Skeleton.Button active style={{ width: "40px", height: "40px", borderRadius: "10px" }} />
            ) : (
              <SearchOutlined />
            )}
          </IconButton>
          {searchValue && (
            isLoading ? (
              <Skeleton.Button active style={{ width: "100px", height: "40px", borderRadius: "10px" }} />
            ) : (
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
            )
          )}
        </Stack>
        
        {isLoading ? (
          <Skeleton.Button active style={{ width: "100px", height: "40px", borderRadius: "10px" }} />
        ) : (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddManager}
            sx={{
              width: { xs: "100%", sm: "auto" },
              height: { xs: "40px", sm: "40px" },
              fontSize: "14px",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            {t("Mangers.AddManager")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ManagersToolbar;