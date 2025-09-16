import React from 'react';
import {
  Button,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  SelectOutlined,
} from "@ant-design/icons";

const RewardsActions = ({
  isAllChecked,
  setIsAllChecked,
  selectedRewards,
  setSelectedRewards,
  tabValue,
  setOpenRejectDialog,
  handleApproveMany,
  setOpenDeleteDialog,
  profile
}) => {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1}
      alignItems="center"
    >
      <Button
        variant={isAllChecked ? "contained" : "outlined"}
        color={isAllChecked ? "warning" : "primary"}
        sx={{
          display: profile.role === "ADMIN" ? "flex" : "none",
          alignItems: "center",
          width: "150px",
          height: "40px",
          fontSize: "12px",
          "&:hover": {
            backgroundColor: isAllChecked ? "warning.main" : "primary.main",
            color: "white",
          },
        }}
        onClick={() => {
          setIsAllChecked(!isAllChecked);
          if (!isAllChecked) setSelectedRewards([]);
        }}
      >
        <SelectOutlined style={{marginRight: '4px'}} />
        {isAllChecked ? t("Rewards.CancelSelect") : t("Rewards.SelectMultiple")}
      </Button>

      {isAllChecked && tabValue === 0 && (
        <>
          <Button 
            sx={{
              backgroundColor: "success.main",
              display: profile.role === "ADMIN" ? "flex" : "none",
              alignItems: "center",
              width: "130px",
              height: "40px",
              fontSize: "12px",
            }}
            variant="contained" 
            color="success"
            onClick={handleApproveMany}
            disabled={selectedRewards.length === 0}
          >
            <CheckCircleOutlined style={{marginRight: '4px'}} />
            {t("Rewards.ApproveSelected", { count: selectedRewards.length })}
          </Button>
          <Button 
            sx={{
              display: profile.role === "ADMIN" ? "flex" : "none",
              alignItems: "center",
              width: "130px",
              height: "40px",
              fontSize: "12px",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
              },
            }}
            variant="contained" 
            color="error"
            onClick={() => setOpenRejectDialog(true)}
            disabled={selectedRewards.length === 0}
          >
            <CloseOutlined style={{marginRight: '4px'}} />
            {t("Rewards.RejectSelected", { count: selectedRewards.length })}
          </Button>
        </>
      )}

      {isAllChecked && (tabValue === 1 || tabValue === 2) && (
        <Button 
          sx={{
            display: profile.role === "ADMIN" ? "flex" : "none",
            alignItems: "center",
            width: "190px",
            height: "40px",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "error.main",
              color: "white",
            },
          }}
          variant="contained" 
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
          disabled={selectedRewards.length === 0}
        >
          <DeleteOutlined style={{marginRight: '4px'}} />
          {t("Rewards.DeleteSelected", { count: selectedRewards.length })}
        </Button>
      )}
    </Stack>
  );
};

export default RewardsActions;