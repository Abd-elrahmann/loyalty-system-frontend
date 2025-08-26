import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Api from "../Config/Api";
import {
  Box,
  Button,
  Tab,
  Tabs,
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
  useMediaQuery,
  Checkbox,
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import RewardsSearchModal from "../Components/Modals/RewardsSearchModal";
import * as xlsx from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RewardsScanModal from "../Components/Modals/RewardsScanModal";
import DeleteModal from "../Components/Modals/DeleteModal";
import { Helmet } from 'react-helmet-async';
import { useUser, updateUserProfile } from "../utilities/user.jsx";
import { Spin } from "antd";
import { DeleteOutlined, CheckOutlined,CheckCircleOutlined, CloseOutlined, SearchOutlined, QrcodeOutlined,SelectOutlined,DoubleLeftOutlined,FileExcelOutlined } from "@ant-design/icons";
import { FilePdfOutlined } from '@ant-design/icons';
import { PrinterOutlined } from '@ant-design/icons';
const Rewards = () => {
  const { t, i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
  const statusMap = {
    PENDING: { label: "PENDING", color: "warning" },
    APPROVED: { label: "APPROVED", color: "success" },
    REJECTED: { label: "REJECTED", color: "error" },
  };

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      const statusLabels = ["PENDING", "APPROVED", "REJECTED"];
      queryParams.append("status", statusLabels[tabValue]);
      if (filters.userId) queryParams.append("userId", filters.userId);
      if (filters.fromDate) queryParams.append("fromDate", filters.fromDate);
      if (filters.toDate) queryParams.append("toDate", filters.toDate);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.minPoints) queryParams.append("minPoints", filters.minPoints);

      const response = await Api.get(`/api/rewards/${page}?${queryParams}`);
      if (response?.data?.rewards) {
        setRewards(response.data.rewards);
        setTotalPages(response.data.totalPages);
      } else {
        setRewards([]);
        setTotalPages(0);
      }
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    } finally {
      setIsLoading(false);
    }
  };
  const FetchProfile = async () => {
    const profileResponse = await Api.get('/api/auth/profile');
    localStorage.setItem('profile', JSON.stringify(profileResponse.data));
    updateUserProfile(profileResponse.data);
  };

  useEffect(() => {
    fetchRewards();
    FetchProfile();
    // Reset selection when data changes
    setSelectedRewards([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tabValue, filters]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleApprove = async (rewardId) => {
    try {
      await Api.patch(`/api/rewards/approve`, {
        rewardIds: [rewardId]
      }); 
      notifySuccess(t("Rewards.RewardApproved"));
      fetchRewards();
      FetchProfile();
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };

  const handleApproveMany = async () => {
    if (selectedRewards.length === 0) {
      notifyError(t("Rewards.NoRewardsSelected"));
      return;
    }
    
    try {
      await Api.patch(`/api/rewards/approve`, {
        rewardIds: selectedRewards 
      })
      notifySuccess(t("Rewards.RewardsApproved", { count: selectedRewards.length }));
      setSelectedRewards([]);
      setIsAllChecked(false);
      fetchRewards();
      FetchProfile();
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };
  

  const handleReject = async () => {
    if (!rewardToReject) return;
    try {
      await Api.patch(`/api/rewards/reject`, {
        rewardIds: [rewardToReject],
        note: rejectNote,
      });

      notifySuccess(t("Rewards.RewardRejected"));
      setOpenRejectDialog(false);
      setRewardToReject(null);
      setRejectNote("");
      fetchRewards();
      FetchProfile();
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };

  const handleRejectMany = async () => {
    if (selectedRewards.length === 0) {
      notifyError(t("Rewards.NoRewardsSelected"));
      return;
    }
    
    try {
      await Api.patch(`/api/rewards/reject`, {
       rewardIds: selectedRewards,
       note: rejectNote,
      });
      notifySuccess(t("Rewards.RewardsRejected", { count: selectedRewards.length }));
      setSelectedRewards([]);
      setIsAllChecked(false);
      setOpenRejectDialog(false);
      setRejectNote("");
      fetchRewards();
      FetchProfile();
    } catch (error) {
        notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };

  const handleDeleteRejectedRewards = async () => {
    try {
      // If we have selected rewards, use those. Otherwise, use the single rewardToDelete
      const rewardsToDelete = selectedRewards.length > 0 ? selectedRewards : [rewardToDelete];
      
      await Api.delete(`/api/rewards`, {
        data: { rewardIds: rewardsToDelete }
      });
    
      
      setOpenDeleteDialog(false);
      setRewardToDelete(null);
      setSelectedRewards([]);
      setIsAllChecked(false);
      
      notifySuccess(
        selectedRewards.length > 0 
          ? t("Rewards.DeleteMultipleRewardsSuccess", { count: selectedRewards.length })
          : t("Rewards.DeleteRejectedRewardsSuccess")
      );
      
      fetchRewards();
      FetchProfile();
    } catch (error) {
        notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
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
      setSelectedRewards(filteredRewards.map(reward => reward.id));
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

        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          sx={{ mt: isMobile ? 2 : 0 }}
          alignItems="center"
        >
          <Button variant="outlined" onClick={exportToCSV} sx={{ height: "40px", width: isMobile ? "140px" : "135px",fontSize: "12px" }}>
            <FileExcelOutlined style={{marginRight: '4px'}} />
            {t("Rewards.ExportExcel")}
          </Button>
          <Button variant="outlined" onClick={exportToPDF} sx={{ height: "40px", width: isMobile ? "140px" : "135px",fontSize: "12px" }}>
            <FilePdfOutlined style={{marginRight: '4px'}} />
            {t("Rewards.ExportPdf")}
          </Button>
          <Button variant="outlined" onClick={PrintRewards} sx={{ height: "40px", width: isMobile ? "140px" : "135px",fontSize: "12px" }}>
            <PrinterOutlined style={{marginRight: '4px'}} />
            {t("Rewards.Print")}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: isMobile ? 1 : 2, mb: isMobile ? 0 : 2,width:isMobile? "100%":"90%" }}>
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
              sx={{ display: profile.role === "ADMIN" ? "" : "none",height: "40px",width:isMobile? '140px' : '130px' }}
              variant="outlined"
              startIcon={<SearchOutlined />}
              onClick={() => setOpenSearchModal(true)}
            >
              {t("Rewards.Search")}
            </Button>
            <IconButton
              sx={{ color: "primary.main", padding: 0 ,display: profile.role === "ADMIN" ? "" : "none",height: "40px",width:isMobile? '140px' : '50px' }}
              onClick={() => setOpenScanModal(true)}
            >
              <QrcodeOutlined />
            </IconButton>
          </Stack>

          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "center" : "flex-end"}
            spacing={1}
            alignItems="center"
          >
              <Button
                variant={isAllChecked ? "contained" : "outlined"}
                color={isAllChecked ? "success" : "primary"}
                sx={{
                  display: profile.role === "ADMIN" ? "flex" : "none",
                  alignItems: "center",
                  width:isMobile? "140px":"150px",
                  height: "40px",
                  fontSize: "12px",
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
                    display: profile.role === "ADMIN" ? "flex" : "none",
                    alignItems: "center",
                    width:isMobile? "140px":"130px",
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
                    width:isMobile? "140px":"130px",
                    height: "40px",
                    fontSize: "12px",
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
                  width:isMobile? "140px":"190px",
                  height: "40px",
                  fontSize: "12px",
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
                {t("Rewards.Image")}
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
                  <Spin size="large" />
                </StyledTableCell>
              </StyledTableRow>
            ) : filteredRewards.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell
                  colSpan={tabValue === 0 ? 7 : 6}
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
                    <img
                      src={
                        reward.cafeProduct?.image ||
                        reward.restaurantProduct?.image ||
                        "-"
                      }
                      alt="Reward Image"
                      style={{ width:isMobile? "50px" : "60px", height:isMobile? "50px" : "60px" }}
                    />
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
                    <Chip
                      label={reward.status}
                      color={statusMap[reward.status]?.color || "default"}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {reward.formattedDate}
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
        isLoading={isLoading}
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
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Rewards;
