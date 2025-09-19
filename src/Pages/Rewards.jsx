import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Api from "../Config/Api";
import {
  Box,
  Button,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import RewardsSearchModal from "../Components/Modals/RewardsSearchModal";
import * as xlsx from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RewardsScanModal from "../Components/Modals/RewardsScanModal";
import DeleteModal from "../Components/Modals/DeleteModal";
import { Helmet } from 'react-helmet-async';
import { useUser, updateUserProfile } from "../utilities/user.jsx";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchOutlined, QrcodeOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import RewardsTable from "../Components/rewards/RewardsTable";
import RewardsActions from "../Components/rewards/RewardsActions";
import RewardsExportButtons from "../Components/rewards/RewardsExportButtons";

const Rewards = () => {
  const { t, i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
    type: "",
    minPoints: "",
  });
  const [rejectNote, setRejectNote] = useState("");
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rewardToReject, setRewardToReject] = useState(null);
  const [openScanModal, setOpenScanModal] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [selectedRewards, setSelectedRewards] = useState([]);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const profile = useUser();
  const queryClient = useQueryClient();

  const fetchRewards = async () => {
    const queryParams = new URLSearchParams();
    const statusLabels = ["PENDING", "APPROVED", "REJECTED"];
    queryParams.append("status", statusLabels[tabValue]);
    if (filters.userId) queryParams.append("userId", filters.userId);
    if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
    if (filters.toDate) queryParams.append("toDate", filters.toDate);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.minPoints) queryParams.append("minPoints", filters.minPoints);

    const response = await Api.get(`/api/rewards/${page}?${queryParams}`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['rewards', page, tabValue, filters],
    queryFn: fetchRewards,
    keepPreviousData: true,
    staleTime: 5000
  });

  const rewards = data?.rewards || [];
  const totalPages = data?.totalPages || 0;

  useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await Api.get('/api/auth/profile');
      localStorage.setItem('profile', JSON.stringify(response.data));
      updateUserProfile(response.data);
      return response.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (rewardIds) => Api.patch(`/api/rewards/approve`, { rewardIds }),
    onSuccess: () => {
      notifySuccess(t("Rewards.RewardApproved"));
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ rewardIds, note }) => 
      Api.patch(`/api/rewards/reject`, { rewardIds, note }),
    onSuccess: () => {
      notifySuccess(t("Rewards.RewardRejected"));
      setOpenRejectDialog(false);
      setRewardToReject(null);
      setRejectNote("");
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (rewardIds) => 
      Api.delete(`/api/rewards`, { data: { rewardIds } }),
    onSuccess: () => {
      setOpenDeleteDialog(false);
      setRewardToDelete(null);
      setSelectedRewards([]);
      setIsAllChecked(false);
      notifySuccess(t("Rewards.DeleteRejectedRewardsSuccess"));
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    setSelectedRewards([]);
  };

  const handleApprove = (rewardId) => {
    approveMutation.mutate([rewardId]);
  };

  const handleApproveMany = () => {
    if (selectedRewards.length === 0) {
      notifyError(t("Rewards.NoRewardsSelected"));
      return;
    }
    approveMutation.mutate(selectedRewards);
  };

  const handleReject = () => {
    if (!rewardToReject) return;
    rejectMutation.mutate({
      rewardIds: [rewardToReject],
      note: rejectNote
    });
  };

  const handleRejectMany = () => {
    if (selectedRewards.length === 0) {
      notifyError(t("Rewards.NoRewardsSelected"));
      return;
    }
    rejectMutation.mutate({
      rewardIds: selectedRewards,
      note: rejectNote
    });
  };

  const handleDeleteRejectedRewards = () => {
    const rewardsToDelete = selectedRewards.length > 0 ? selectedRewards : [rewardToDelete];
    deleteMutation.mutate(rewardsToDelete);
  };

  const handleSelectReward = (rewardId) => {
    setSelectedRewards(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRewards(rewards.map(reward => reward.id));
    } else {
      setSelectedRewards([]);
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1);
  };

  const filteredRewards = rewards.filter(
    (reward) => reward.status === ["PENDING", "APPROVED", "REJECTED"][tabValue]
  );

  const exportToCSV = () => {
    try {
      const exportData = filteredRewards.map((reward) => ({
        ID: reward.id,
        "Customer Name": i18n.language === "ar" ? reward.user?.arName : reward.user?.enName,
        "Product Name":
          i18n.language === "ar" ? reward.cafeProduct?.arName || reward.restaurantProduct?.arName : reward.cafeProduct?.enName || reward.restaurantProduct?.enName || "",
        Points: reward.points,
        Type: reward.type,
        Status: reward.status,
        Date: reward.formattedDate,
        ...(reward.status === "REJECTED" && {
          "Rejection Note": reward.note || "",
        }),
      }));

      const csv = xlsx.utils.json_to_sheet(exportData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, csv, "Rewards");
      xlsx.writeFile(
        workbook,
        i18n.language === "ar"
          ? `تقرير_المكافئات_${
              ["pending", "approved", "rejected"][tabValue]
            }_${new Date().toLocaleDateString()}.xlsx`
          : `rewards_${
              ["pending", "approved", "rejected"][tabValue]
            }_report.xlsx`
      );
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError"));
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      doc.addFont("/assets/fonts/Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("/assets/fonts/Amiri-Bold.ttf", "Amiri", "bold");
      doc.setFont("Amiri");
      doc.setFontSize(16);
      doc.text(
        `${
          ["Pending", "Approved", "Rejected"][tabValue]
        } Rewards Report | ${new Date().toLocaleDateString()}`,
        14,
        15
      );

      const columns = [
        "ID",
        "Customer Name",
        "Product Name",
        "Points",
        "Type",
        "Status",
        "Date",
        ...(tabValue === 2 ? ["Rejection Note"] : []),
      ];

      const rows = filteredRewards.map((reward) => [
        reward.id,
        i18n.language === "ar" ? reward.user?.arName : reward.user?.enName,
        i18n.language === "ar"
          ? reward.cafeProduct?.arName || reward.restaurantProduct?.arName
          : reward.cafeProduct?.enName || reward.restaurantProduct?.enName,
        reward.points,
        reward.type,
        reward.status,
        reward.formattedDate,
        ...(tabValue === 2 ? [reward.note || "-"] : []),
      ]);

      autoTable(doc, {
        startY: 25,
        head: [columns],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 128] },
        columnStyles: {
          1: {
            font: "Amiri",
            fontStyle: "bold",
            halign: i18n.language === "ar" ? "right" : "left",
            cellWidth: 40,
          },
          2: {
            font: "Amiri",
            fontStyle: "bold",
            halign: i18n.language === "ar" ? "right" : "left",
            cellWidth: 40,
          },
        },
      });

      doc.save(
        i18n.language === "ar"
          ? `تقرير_المكافئات_${
              ["pending", "approved", "rejected"][tabValue]
            }_${new Date().toLocaleDateString()}.pdf`
          : `rewards_${
              ["pending", "approved", "rejected"][tabValue]
            }_report.pdf`
      );
    } catch (error) {
      console.log(error);
      notifyError(t("Errors.generalError"));
    }
  };

  const PrintRewards = () => {
    try {
      const printWindow = window.open("", "_blank");
      const filteredRewards = rewards;

      const tableHeader = `
        <tr>
          <th>ID</th>
          <th>${t("Rewards.Customer")}</th>
          <th>${t("Rewards.Product")}</th>
          <th>${t("Rewards.Points")}</th>
          <th>${t("Rewards.Type")}</th>
          <th>${t("Rewards.Status")}</th>
          <th>${t("Rewards.Date")}</th>
          ${tabValue === 2 ? `<th>${t("Rewards.RejectionNote")}</th>` : ""}
        </tr>
      `;

      const tableRows = filteredRewards
        .map(
          (reward) => `
        <tr>
          <td>${reward.id}</td>
          <td>${
            i18n.language === "ar" ? reward.user?.arName : reward.user?.enName
          }</td>
          <td>${
            i18n.language === "ar"
              ? reward.cafeProduct?.arName || reward.restaurantProduct?.arName
              : reward.cafeProduct?.enName || reward.restaurantProduct?.enName
          }</td>
          <td>${reward.points}</td>
          <td>${reward.type}</td>
          <td>${reward.status}</td>
          <td>${reward.formattedDate}</td>
          ${tabValue === 2 ? `<td>${reward.note || "-"}</td>` : ""}
        </tr>
      `
        )
        .join("");

      const html = `
        <html dir="${i18n.language === "ar" ? "rtl" : "ltr"}">
          <head>
            <title>${t("Rewards.PrintTitle")}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: ${
                i18n.language === "ar" ? "right" : "left"
              }; }
              th { background-color: #f2f2f2; }
              @media print {
                @page { size: landscape; }
              }
            </style>
          </head>
          <body>
            <h2>${t("Rewards.RewardsReport")} - ${
        ["Pending", "Approved", "Rejected"][tabValue]
      }</h2>
            <table>
              ${tableHeader}
              ${tableRows}
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error(error);
      notifyError(t("Errors.PrintError"));
    }
  };

  const handleScanSuccess = (userId) => {
    setFilters(prev => ({
      ...prev,
      userId: userId
    }));
    setPage(1);
    notifySuccess(t("Rewards.ScanQRSuccess"));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Helmet>
        <title>{t("Rewards.Rewards")}</title>
        <meta name="description" content={t("Rewards.RewardsDescription")} />
      </Helmet>
      
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: "divider", 
        mb: 2,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t("Rewards.Pending")} sx={{ color: "warning.main" }} />
          <Tab label={t("Rewards.Approved")} sx={{ color: "success.main" }} />
          <Tab label={t("Rewards.Rejected")} sx={{ color: "error.main" }} />
        </Tabs>

        <RewardsExportButtons
          exportToCSV={exportToCSV}
          exportToPDF={exportToPDF}
          PrintRewards={PrintRewards}
          isMobile={isMobile}
        />
      </Box>

      <Box sx={{ p: isMobile ? 1 : 2, mb: isMobile ? 0 : 2, width: isMobile ? "100%" : "90%" }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          justifyContent={isMobile ? "center" : "space-between"}
          spacing={1}
          alignItems="center"
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "center" : "flex-start"}
            spacing={1}
            alignItems="center"
          >
            <Button
              sx={{ display: profile.role === "ADMIN" ? "" : "none", height: "40px", width: isMobile ? '140px' : '130px',
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
              variant="outlined"
              startIcon={<SearchOutlined />}
              onClick={() => setOpenSearchModal(true)}
            >
              {t("Rewards.Search")}
            </Button>
            <IconButton
              sx={{ color: "primary.main", padding: 0, display: profile.role === "ADMIN" ? "" : "none", height: "40px", width: isMobile ? '140px' : '50px' }}
              onClick={() => setOpenScanModal(true)}
            >
              <QrcodeOutlined />
            </IconButton>
          </Stack>

          <RewardsActions
            isAllChecked={isAllChecked}
            setIsAllChecked={setIsAllChecked}
            selectedRewards={selectedRewards}
            tabValue={tabValue}
            setOpenRejectDialog={setOpenRejectDialog}
            handleApproveMany={handleApproveMany}
            setOpenDeleteDialog={setOpenDeleteDialog}
            profile={profile}
          />

          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "center" : "flex-start"}
            spacing={2}
            alignItems="center"
          >
            <Button
              variant="outlined"
              startIcon={<DoubleLeftOutlined />}
              onClick={() => {
                setFilters({
                  fromDate: null,
                  toDate: null,
                  type: "",
                  minPoints: "",
                  userId: "",
                });
                setPage(1);
              }}
              sx={{
                display: profile.role === "ADMIN" ? "" : "none",
                height: "40px",
                visibility:
                  filters.fromDate ||
                  filters.toDate ||
                  filters.type ||
                  filters.minPoints ||
                  filters.userId
                    ? "visible"
                    : "hidden",
              }}
            >
              {t("Rewards.ResetFilters")}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <RewardsTable
        tabValue={tabValue}
        filteredRewards={filteredRewards}
        isLoading={isLoading}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        isAllChecked={isAllChecked}
        selectedRewards={selectedRewards}
        handleSelectReward={handleSelectReward}
        handleSelectAll={handleSelectAll}
        handleApprove={handleApprove}
        setRewardToReject={setRewardToReject}
        setOpenRejectDialog={setOpenRejectDialog}
        setRewardToDelete={setRewardToDelete}
        setOpenDeleteDialog={setOpenDeleteDialog}
        profile={profile}
        i18n={i18n}
      />

      <RewardsSearchModal
        open={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        onSearch={handleSearch}
      />

      {/* Reject Dialog */}
      <DeleteModal
        open={openRejectDialog}
        onClose={() => {
          setOpenRejectDialog(false);
          setRewardToReject(null);
          setRejectNote("");
        }}
        message={
          <div>
            <p>
              {rewardToReject 
                ? t("Rewards.RejectConfirmation")
                : t("Rewards.RejectManyConfirmation", { count: selectedRewards.length })}
            </p>
            <textarea
              placeholder={t("Rewards.RejectionReasonOptional")}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              style={{
                width: "100%",
                minHeight: "80px",
                marginTop: "10px",
                padding: "8px",
              }}
            />
          </div>
        }
        title={
          rewardToReject 
            ? t("Rewards.RejectReward")
            : t("Rewards.RejectManyRewards")
        }
        ButtonText={t("Rewards.Reject")}
        onConfirm={rewardToReject ? handleReject : handleRejectMany}
        isLoading={rejectMutation.isLoading}
      />

      <RewardsScanModal
        open={openScanModal}
        onClose={() => setOpenScanModal(false)}
        onScanSuccess={handleScanSuccess}
      />

      <DeleteModal
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setRewardToDelete(null);
          setSelectedRewards([]);
          setIsAllChecked(false);   
        }}
        message={
          selectedRewards.length > 0
            ? t("Rewards.DeleteMultipleRewardsConfirm", { count: selectedRewards.length })
            : t("Rewards.DeleteRejectedRewards")
        }
        title={t("Rewards.DeleteSelected")}
        ButtonText={t("Rewards.DeleteSelected")}
        onConfirm={handleDeleteRejectedRewards}
        isLoading={deleteMutation.isLoading}
      />
    </Box>
  );
};

export default Rewards;