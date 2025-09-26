import React from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Checkbox,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { CheckCircleOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const RewardCard = ({
  reward,
  tabValue,
  isAllChecked,
  selectedRewards,
  handleSelectReward,
  handleApprove,
  setRewardToReject,
  setOpenRejectDialog,
  setRewardToDelete,
  setOpenDeleteDialog,
  profile,
  i18n,
  t,
  orderBy,
  order,
  handleSort,
}) => {
  const statusMap = {
    PENDING: { label: "PENDING", color: "warning" },
    APPROVED: { label: "APPROVED", color: "success" },
    REJECTED: { label: "REJECTED", color: "error" },
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2,
        border: '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <Stack spacing={2}>
        {/* Header with ID and Checkbox */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {profile.role === "ADMIN" && (
            <Box>
              <TableSortLabel
                active={orderBy === "id"}
                direction={orderBy === "id" ? order : "asc"}
                onClick={() => handleSort("id")}
                sx={{ color: "primary.main !important" }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  ID: {reward.id}
                </Typography>
              </TableSortLabel>
            </Box>
          )}
          {isAllChecked && (
            <Checkbox
              checked={selectedRewards.includes(reward.id)}
              onChange={() => handleSelectReward(reward.id)}
            />
          )}
        </Box>

        {/* Customer Info */}
        {profile.role === "ADMIN" && (
          <Box>
            <TableSortLabel
              active={orderBy === "user.name"}
              direction={orderBy === "user.name" ? order : "asc"}
              onClick={() => handleSort("user.name")}
              sx={{ color: "primary.main !important" }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("Rewards.Customer")}:
              </Typography>
            </TableSortLabel>
            <Typography variant="body1">
              {i18n.language === "ar" ? reward.user?.arName : reward.user?.enName}
            </Typography>
          </Box>
        )}

        {/* Product Info with Image */}
        <Stack direction="row" spacing={2} alignItems="center">
          <img
            src={reward.cafeProduct?.image || reward.restaurantProduct?.image || "-"}
            alt="Reward"
            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
          />
          <Box flex={1}>
            <TableSortLabel
              active={orderBy === "product.name"}
              direction={orderBy === "product.name" ? order : "asc"}
              onClick={() => handleSort("product.name")}
              sx={{ color: "primary.main !important" }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("Rewards.Product")}:
              </Typography>
            </TableSortLabel>
            <Typography variant="body1">
              {reward.cafeProduct
                ? i18n.language === "ar"
                  ? reward.cafeProduct.arName
                  : reward.cafeProduct.enName
                : reward.restaurantProduct
                ? i18n.language === "ar"
                  ? reward.restaurantProduct.arName
                  : reward.restaurantProduct.enName
                : "-"}
            </Typography>
          </Box>
        </Stack>

        {/* Points and Type */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <TableSortLabel
              active={orderBy === "points"}
              direction={orderBy === "points" ? order : "asc"}
              onClick={() => handleSort("points")}
              sx={{ color: "primary.main !important" }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("Rewards.Points")}:
              </Typography>
            </TableSortLabel>
            <Typography variant="body1">{reward.points}</Typography>
          </Box>
          <Box>
            <TableSortLabel
              active={orderBy === "type"}
              direction={orderBy === "type" ? order : "asc"}
              onClick={() => handleSort("type")}
              sx={{ color: "primary.main !important" }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("Rewards.Type")}:
              </Typography>
            </TableSortLabel>
            <Typography
              variant="body1"
              sx={{
                color: reward.type === "cafe" ? "#8B4513" : "inherit",
              }}
            >
              {reward.type}
            </Typography>
          </Box>
        </Stack>

        {/* Status and Date */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <TableSortLabel
              active={orderBy === "status"}
              direction={orderBy === "status" ? order : "asc"}
              onClick={() => handleSort("status")}
              sx={{ color: "primary.main !important" }}
            >
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {t("Rewards.Status")}:
              </Typography>
            </TableSortLabel>
            <Chip
              label={reward.status}
              color={statusMap[reward.status]?.color || "default"}
              size="small"
            />
          </Box>
          <Box>
            <TableSortLabel
              active={orderBy === "date"}
              direction={orderBy === "date" ? order : "asc"}
              onClick={() => handleSort("date")}
              sx={{ color: "primary.main !important" }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("Rewards.Date")}:
              </Typography>
            </TableSortLabel>
            <Typography variant="body2">
              {dayjs(reward.date).format('DD/MM/YYYY hh:mm')}
            </Typography>
          </Box>
        </Stack>

        {/* Rejection Note */}
        {tabValue === 2 && !isAllChecked && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {t("Rewards.RejectionNote")}:
            </Typography>
            <Typography variant="body2">
              {reward.note || "-"}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        {profile.role === "ADMIN" && (
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="center"
            sx={{ 
              mt: 1,
              pt: 1,
              borderTop: '1px solid #e0e0e0'
            }}
          >
            {tabValue === 0 && !isAllChecked && (
              <>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleApprove(reward.id)}
                  title={t("Rewards.Approve")}
                >
                  <CheckCircleOutlined />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setRewardToReject(reward.id);
                    setOpenRejectDialog(true);
                  }}
                  title={t("Rewards.Reject")}
                >
                  <CloseOutlined />
                </IconButton>
              </>
            )}
            {(tabValue === 1 || tabValue === 2) && !isAllChecked && (
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setRewardToDelete(reward.id);
                  setOpenDeleteDialog(true);
                }}
              >
                <DeleteOutlined />
              </IconButton>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default RewardCard;
