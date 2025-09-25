import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Stack,
  Chip,
  Checkbox,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Shared/tableLayout";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { CheckCircleOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import RewardCard from './RewardCard';

const RewardsTable = ({
  tabValue,
  filteredRewards,
  isLoading,
  totalPages,
  page,
  setPage,
  isAllChecked,
  selectedRewards,
  handleSelectReward,
  handleSelectAll,
  handleApprove,
  setRewardToReject,
  setOpenRejectDialog,
  setRewardToDelete,
  setOpenDeleteDialog,
  profile,
  i18n
}) => {
  const { t } = useTranslation();

  const statusMap = {
    PENDING: { label: "PENDING", color: "warning" },
    APPROVED: { label: "APPROVED", color: "success" },
    REJECTED: { label: "REJECTED", color: "error" },
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ maxHeight: 650, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Spin size="large" />
          </Box>
        ) : filteredRewards.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            {t("Rewards.NoRewards")}
          </Box>
        ) : (
          <>
            <Stack spacing={2} sx={{ mb: 2 }}>
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  tabValue={tabValue}
                  isAllChecked={isAllChecked}
                  selectedRewards={selectedRewards}
                  handleSelectReward={handleSelectReward}
                  handleApprove={handleApprove}
                  setRewardToReject={setRewardToReject}
                  setOpenRejectDialog={setOpenRejectDialog}
                  setRewardToDelete={setRewardToDelete}
                  setOpenDeleteDialog={setOpenDeleteDialog}
                  profile={profile}
                  i18n={i18n}
                  t={t}
                />
              ))}
            </Stack>
            <TablePagination
              component="div"
              count={totalPages * 10}
              page={page - 1}
              onPageChange={(e, newPage) => setPage(newPage + 1)}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              labelRowsPerPage={t("Rewards.RowsPerPage")}
            />
          </>
        )}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {isAllChecked && (
              <StyledTableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedRewards.length > 0 &&
                    selectedRewards.length < filteredRewards.length
                  }
                  checked={
                    filteredRewards.length > 0 &&
                    selectedRewards.length === filteredRewards.length
                  }
                  onChange={handleSelectAll}
                />
              </StyledTableCell>
            )}
            <StyledTableCell align="center" sx={{ display: profile.role === "ADMIN" ? "" : "none" }}>
              {t("Rewards.ID")}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ display: profile.role === "ADMIN" ? "" : "none" }}>
              {t("Rewards.Customer")}
            </StyledTableCell>
            <StyledTableCell align="center">
              {t("Rewards.Product")}
            </StyledTableCell>
            <StyledTableCell align="center">
              {t("Rewards.Points")}
            </StyledTableCell>
            <StyledTableCell align="center">
              {t("Rewards.Type")}
            </StyledTableCell>
            <StyledTableCell align="center">
              {t("Rewards.Status")}
            </StyledTableCell>
            <StyledTableCell align="center">
              {t("Rewards.Date")}
            </StyledTableCell>
            {tabValue === 0 && !isAllChecked && profile.role === "ADMIN" && (
              <StyledTableCell align="center">
                {t("Rewards.Actions")}
              </StyledTableCell>
            )}
            {tabValue === 2 && !isAllChecked && profile.role === "ADMIN" && (
              <StyledTableCell align="center">
                {t("Rewards.RejectionNote")}
              </StyledTableCell>
            )}
            {(tabValue === 1 || tabValue === 2) && !isAllChecked && profile.role === "ADMIN" && (
              <StyledTableCell align="center">
                {t("Rewards.Actions")}
              </StyledTableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell
                colSpan={tabValue === 0 ? 7 : 6}
                align="center"
                justifyContent="center"
              >
                <Spin size="large" style={{left:'150px'}} />
              </StyledTableCell>
            </StyledTableRow>
          ) : filteredRewards.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell
                colSpan={9}
                align="center"
              >
                {t("Rewards.NoRewards")}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            filteredRewards.map((reward) => (
              <StyledTableRow key={reward.id} hover>
                {isAllChecked && (
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRewards.includes(reward.id)}
                      onChange={() => handleSelectReward(reward.id)}
                    />
                  </StyledTableCell>
                )}
                <StyledTableCell align="center" sx={{ display: profile.role === "ADMIN" ? "" : "none" }}>{reward.id}</StyledTableCell>
                <StyledTableCell align="center" sx={{ display: profile.role === "ADMIN" ? "" : "none" }}>
                  {i18n.language === "ar"
                    ? reward.user?.arName
                    : reward.user?.enName}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {reward.cafeProduct
                    ? `${
                        i18n.language === "ar"
                          ? reward.cafeProduct.arName
                          : reward.cafeProduct.enName
                      }`
                    : reward.restaurantProduct
                    ? `${
                        i18n.language === "ar"
                          ? reward.restaurantProduct.arName
                          : reward.restaurantProduct.enName
                      }`
                    : "-"}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {reward.points}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <span
                    style={{
                      color: reward.type === "cafe" ? "#8B4513" : "inherit",
                    }}
                  >
                    {reward.type}
                  </span>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip sx={{fontSize: "12px"}}
                    label={reward.status}
                    color={statusMap[reward.status]?.color || "default"}
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  {dayjs(reward.date).format('DD/MM/YYYY hh:mm')}
                </StyledTableCell>
                {tabValue === 0 && !isAllChecked && (
                  <StyledTableCell align="center">
                    <Stack
                      sx={{ display: profile.role === "ADMIN" ? "flex" : "none" }}
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                    >
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
                    </Stack>
                  </StyledTableCell>
                )}
                {tabValue === 2 && !isAllChecked && (
                  <StyledTableCell align="center">
                    {reward.note || "-"}
                  </StyledTableCell>
                )}
                {(tabValue === 1 || tabValue === 2) && !isAllChecked && profile.role === "ADMIN" && (
                  <StyledTableCell align="center">
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
                  </StyledTableCell>
                )}
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalPages * 10}
        page={page - 1}
        onPageChange={(e, newPage) => setPage(newPage + 1)}
        rowsPerPage={10}
        rowsPerPageOptions={[10]}
        labelRowsPerPage={t("Rewards.RowsPerPage")}
      />
    </TableContainer>
  );
};

export default RewardsTable;