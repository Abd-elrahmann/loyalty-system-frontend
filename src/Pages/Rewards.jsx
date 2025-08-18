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
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../Components/Shared/tableLayout";
import { FaCheck, FaTimes, FaSearch, FaSync } from "react-icons/fa";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import RewardsSearchModal from "../Components/Modals/RewardsSearchModal";
import Spinner from "../utilities/Spinner";
import DeleteModal from "../Components/Modals/DeleteModal";
import * as xlsx from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RewardsScanModal from "../Components/Modals/RewardsScanModal";
import { FaQrcode } from "react-icons/fa";


const Rewards = () => {
  const { t, i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");
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

  useEffect(() => {
    fetchRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tabValue, filters]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleApprove = async (rewardId) => {
    try {
      await Api.patch(`/api/rewards/${rewardId}/approve`);
      notifySuccess(t("Rewards.RewardApproved"));
      fetchRewards();
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  };

  const handleReject = async () => {
    if (!rewardToReject) return;
    try {
      await Api.patch(`/api/rewards/${rewardToReject}/reject`, {
        note: rejectNote,
      });
      notifySuccess(t("Rewards.RewardRejected"));
      setOpenRejectDialog(false);
      setRewardToReject(null);
      setRejectNote("");
      fetchRewards();
    } catch (error) {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
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
        "Customer English Name": reward.user?.enName || "",
        "Customer Arabic Name": reward.user?.arName || "",
        "Product English Name":
          reward.cafeProduct?.enName || reward.restaurantProduct?.enName || "",
        "Product Arabic Name":
          reward.cafeProduct?.arName || reward.restaurantProduct?.arName || "",
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

      doc.addFont("./src/assets/fonts/Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("./src/assets/fonts/Amiri-Bold.ttf", "Amiri", "bold");

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
            // Customer Name column
            font: "Amiri",
            fontStyle: "bold",
            halign: i18n.language === "ar" ? "right" : "left",
            cellWidth: 40,
          },
          2: {
            // Product Name column
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
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t("Rewards.Pending")} sx={{ color: "warning.main" }} />
          <Tab label={t("Rewards.Approved")} sx={{ color: "success.main" }} />
          <Tab label={t("Rewards.Rejected")} sx={{ color: "error.main" }} />
        </Tabs>
      </Box>

      <Box sx={{ p: isMobile ? 1 : 2, mb: isMobile ? 0 : 2 }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          justifyContent={isMobile ? "center" : "space-between"}
          spacing={2}
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "center" : "flex-start"}
            spacing={2}
          >
            <Button
              variant="contained"
              startIcon={<FaSearch size={16} />}
              onClick={() => setOpenSearchModal(true)}
            >
              {t("Rewards.Search")}
            </Button>
            <IconButton
              sx={{ color: "primary.main", padding: 0 }}
              onClick={() => setOpenScanModal(true)}
            >
              <FaQrcode />
            </IconButton>
          </Stack>
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "center" : "flex-end"}
            spacing={2}
          >
            <Button variant="contained" onClick={exportToCSV}>
              {t("Rewards.ExportExcel")}
            </Button>
            <Button variant="contained" onClick={exportToPDF}>
              {t("Rewards.ExportPdf")}
            </Button>
            <Button variant="contained" onClick={PrintRewards}>
              {t("Rewards.Print")}
            </Button>
          </Stack>
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "center" : "flex-start"}
            spacing={2}
          >
            <Button
              variant="contained"
              startIcon={<FaSync size={16} />}
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
              <StyledTableCell align="center">
                {t("Rewards.ID")}
              </StyledTableCell>
              <StyledTableCell align="center">
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
              {tabValue === 0 && (
                <StyledTableCell align="center">
                  {t("Rewards.Actions")}
                </StyledTableCell>
              )}
              {tabValue === 2 && (
                <StyledTableCell align="center">
                  {t("Rewards.RejectionNote")}
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
                  <Spinner />
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
                <StyledTableRow key={reward.id}>
                  <StyledTableCell align="center">{reward.id}</StyledTableCell>
                  <StyledTableCell align="center">
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
                      style={{ width: "50px", height: "50px" }}
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
                  {tabValue === 0 && (
                    <StyledTableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <IconButton
                          color="success"
                          onClick={() => handleApprove(reward.id)}
                          title={t("Rewards.Approve")}
                        >
                          <FaCheck />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setRewardToReject(reward.id);
                            setOpenRejectDialog(true);
                          }}
                          title={t("Rewards.Reject")}
                        >
                          <FaTimes />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  )}
                  {tabValue === 2 && (
                    <StyledTableCell align="center">
                      {reward.note || "-"}
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
          fetchRewards();
        }}
        message={
          <div>
            <p>{t("Rewards.RejectConfirmation")}</p>
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
        title={t("Rewards.RejectReward")}
        ButtonText={t("Rewards.Reject")}
        onConfirm={handleReject}
        isLoading={isLoading}
      />

      <RewardsScanModal
        open={openScanModal}
        onClose={() => setOpenScanModal(false)}
        onScanSuccess={handleScanSuccess}
      />
    </Box>
  );
};

export default Rewards;
