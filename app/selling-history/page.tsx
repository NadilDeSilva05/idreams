"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import BuildIcon from "@mui/icons-material/Build";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import PaletteIcon from "@mui/icons-material/Palette";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import { useBills, inferBillItemCategory, BillItem } from "@/hooks/useBills";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
};

const getBatteryColor = (health?: number) => {
  if (!health) return "#94a3b8";
  if (health >= 88) return "#10b981";
  if (health >= 80) return "#f59e0b";
  return "#ef4444";
};

type ExtendedBillItem = BillItem & {
  billId: string;
  billFirestoreId: string;
  date: string;
  customer: string;
  customerPhone?: string;
  paymentMethod?: string;
  billStatus: string;
  billTotal?: number;
  category: "smartphone" | "accessory" | "repair";
};

export default function SellingHistoryPage() {
  const { bills, loading } = useBills();
  const [activeTab, setActiveTab] = useState<"smartphone" | "accessory" | "repair">("smartphone");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [slotMounted, setSlotMounted] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.getElementById("topbar-export-slot")) {
        setSlotMounted(true);
        window.clearInterval(id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, []);

  const allItems: ExtendedBillItem[] = useMemo(() => {
    const items: ExtendedBillItem[] = [];
    bills.forEach((bill) => {
      if (bill.status === "Draft") return;
      bill.items.forEach((item) => {
        items.push({
          ...item,
          billId: bill.id,
          billFirestoreId: bill.firestoreId || "",
          date: bill.date,
          customer: bill.customer,
          customerPhone: bill.phone,
          paymentMethod: bill.paymentMethod,
          billStatus: bill.status,
          billTotal: bill.total,
          category: inferBillItemCategory(item),
        });
      });
    });
    return items;
  }, [bills]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesTab = item.category === activeTab;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.billId && item.billId.toLowerCase().includes(searchLower)) ||
        (item.customer && item.customer.toLowerCase().includes(searchLower)) ||
        (item.imei && item.imei.toLowerCase().includes(searchLower)) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.model && item.model.toLowerCase().includes(searchLower)) ||
        (item.customerPhone && item.customerPhone.includes(searchTerm));

      let matchesDate = true;
      if (dateFrom || dateTo) {
        try {
          const itemDate = new Date(item.date);
          if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            if (itemDate < from) matchesDate = false;
          }
          if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (itemDate > to) matchesDate = false;
          }
        } catch {
          /* skip */
        }
      }
      return matchesTab && matchesSearch && matchesDate;
    });
  }, [allItems, activeTab, searchTerm, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const tabItems = allItems.filter((i) => i.category === activeTab);
    const totalRevenue = tabItems.reduce((s, i) => s + i.price * i.qty, 0);
    const totalUnits = tabItems.reduce((s, i) => s + i.qty, 0);
    const uniqueBills = new Set(tabItems.map((i) => i.billId)).size;
    return { totalRevenue, totalUnits, uniqueBills };
  }, [allItems, activeTab]);

  const renderStatusChip = (status: string) => (
    <Chip
      label={status}
      size="small"
      color={status === "Paid" ? "success" : status === "Undone" ? "error" : status === "Partial" ? "warning" : "info"}
      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
    />
  );

  const exportCSV = () => {
    const headers = activeTab === "smartphone"
      ? ["Date", "Invoice", "Customer", "Phone", "Brand", "Model", "Storage", "Condition", "Color", "IMEI", "Unit Price", "Status", "Payment"]
      : activeTab === "accessory"
      ? ["Date", "Invoice", "Customer", "Phone", "Item", "Warranty", "Qty", "Unit Price", "Total", "Status", "Payment"]
      : ["Date", "Invoice", "Customer", "Phone", "Repair Service", "Qty", "Unit Price", "Total", "Status", "Payment"];
    const rows = filteredItems.map((item) => {
      if (activeTab === "smartphone") {
        return [
          item.date, item.billId, item.customer, item.customerPhone || "",
          item.brand || "", item.model || "", item.storage || "", item.type || "",
          (item as any).color || "", item.imei || "", item.price, item.billStatus,
          item.paymentMethod || "",
        ];
      }
      if (activeTab === "accessory") {
        return [
          item.date, item.billId, item.customer, item.customerPhone || "",
          item.name, item.warranty || "No Warranty", item.qty, item.price,
          item.price * item.qty, item.billStatus, item.paymentMethod || "",
        ];
      }
      return [
        item.date, item.billId, item.customer, item.customerPhone || "",
        item.name, item.qty, item.price, item.price * item.qty,
        item.billStatus, item.paymentMethod || "",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selling-history-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const smartphoneCount = allItems.filter((i) => i.category === "smartphone").length;
  const accessoryCount = allItems.filter((i) => i.category === "accessory").length;
  const repairCount = allItems.filter((i) => i.category === "repair").length;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", py: 2.5 }}>
      <Container maxWidth="xl">
        {slotMounted &&
          createPortal(
            <Tooltip title={activeTab === "smartphone" ? "Export Smartphones CSV" : activeTab === "accessory" ? "Export Accessories CSV" : "Export Repairs CSV"}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
                onClick={exportCSV}
                disabled={filteredItems.length === 0}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: "#c4b5fd",
                  color: "#7c3aed",
                  backgroundColor: "#f5f3ff",
                  "&:hover": { backgroundColor: "#ede9fe", borderColor: "#7c3aed" },
                  whiteSpace: "nowrap",
                }}
              >
                Export {activeTab === "smartphone" ? "Phones" : activeTab === "accessory" ? "Accs" : "Repairs"}
              </Button>
            </Tooltip>,
            document.getElementById("topbar-export-slot") as HTMLElement
          )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#f5f3ff", color: "#7c3aed" }}>
                  <PointOfSaleIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  {activeTab === "smartphone" ? "Phone Sales" : activeTab === "accessory" ? "Accessory Sales" : "Repair Sales"}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {formatCurrency(summary.totalRevenue)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                {summary.uniqueBills} invoices • lifetime value
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#fff7ed", color: "#ea580c" }}>
                  <ReceiptLongIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Units Sold
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#ea580c" }}>
                {summary.totalUnits}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                total line-item quantity
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#ecfdf5", color: "#059669" }}>
                  <LocalAtmIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Avg. Line Value
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#059669" }}>
                {formatCurrency(filteredItems.length > 0
                  ? filteredItems.reduce((s, i) => s + i.price * i.qty, 0) / filteredItems.length
                  : 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                per line item (filtered)
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ borderRadius: 3, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              px: 2,
              pt: 1,
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: "#fafaf9",
              "& .MuiTabs-indicator": { backgroundColor: "#7c3aed", height: 3 },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.95rem", color: "#64748b", minHeight: 56 },
              "& .Mui-selected": { color: "#7c3aed" },
            }}
          >
            <Tab
              value="smartphone"
              icon={<SmartphoneIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Smartphones
                  <Chip
                    label={smartphoneCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "smartphone" ? "#ddd6fe" : "#e2e8f0",
                      color: activeTab === "smartphone" ? "#6d28d9" : "#475569",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="accessory"
              icon={<HeadphonesIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Accessories
                  <Chip
                    label={accessoryCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "accessory" ? "#ddd6fe" : "#e2e8f0",
                      color: activeTab === "accessory" ? "#6d28d9" : "#475569",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="repair"
              icon={<BuildIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Repairs
                  <Chip
                    label={repairCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "repair" ? "#ddd6fe" : "#e2e8f0",
                      color: activeTab === "repair" ? "#6d28d9" : "#475569",
                    }}
                  />
                </Box>
              }
            />
          </Tabs>

          <Box sx={{ p: 2, backgroundColor: "#fafaf9", borderBottom: "1px solid #f1f5f9" }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by item, customer, invoice, phone, or IMEI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                      sx: { backgroundColor: "#ffffff", borderRadius: 2 }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { backgroundColor: "#ffffff", borderRadius: 2 }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { backgroundColor: "#ffffff", borderRadius: 2 }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                {(dateFrom || dateTo || searchTerm) && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => { setDateFrom(""); setDateTo(""); setSearchTerm(""); }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 1.1,
                      color: "#64748b",
                      borderColor: "#cbd5e1",
                      "&:hover": { backgroundColor: "#f8fafc", borderColor: "#94a3b8" },
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#7c3aed" }} />
            </Box>
          ) : (
            <TableContainer
              sx={{
                maxHeight: "calc(100vh - 360px)",
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <Table stickyHeader size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                <colgroup>
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "43%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        py: 1.5,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarMonthIcon sx={{ fontSize: 14, color: "#7c3aed" }} />
                        Date / Invoice
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        py: 1.5,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ReceiptLongIcon sx={{ fontSize: 14, color: "#7c3aed" }} />
                        Customer / Pay
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        py: 1.5,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {activeTab === "smartphone" && <SmartphoneIcon sx={{ fontSize: 14, color: "#7c3aed" }} />}
                        {activeTab === "accessory" && <HeadphonesIcon sx={{ fontSize: 14, color: "#7c3aed" }} />}
                        {activeTab === "repair" && <BuildIcon sx={{ fontSize: 14, color: "#7c3aed" }} />}
                        {activeTab === "smartphone" ? "Device Details (Smartphone)" :
                         activeTab === "accessory" ? "Item Details (Accessory)" :
                         "Job Details (Repair)"}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 800,
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        py: 1.5,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                        <LocalAtmIcon sx={{ fontSize: 14, color: "#7c3aed" }} />
                        Pricing &amp; Status
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 56, height: 56, borderRadius: 3,
                              backgroundColor: "#f1f5f9", color: "#94a3b8",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <HistoryIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Typography variant="body1" sx={{ color: "#475569", fontWeight: 700 }}>
                            No {activeTab === "smartphone" ? "smartphone sales" : activeTab === "accessory" ? "accessory sales" : "repair sales"} found
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, maxWidth: 380 }}>
                            Try clearing search filters, adjusting the date range, or process a new {activeTab === "smartphone" ? "phone" : activeTab === "accessory" ? "accessory" : "repair"} sale in the POS terminal.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item, index) => (
                      <TableRow
                        key={`${item.billId}-${index}`}
                        hover
                        sx={{
                          "&:hover td": { backgroundColor: "#fafaf9" },
                          verticalAlign: "top",
                        }}
                      >
                        {/* COLUMN 1 — Date + Invoice stacked */}
                        <TableCell sx={{ py: 1.25 }}>
                          <Stack spacing={0.5}>
                            <Tooltip title={formatDateTime(item.date)} placement="top-start">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#475569",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                  display: "block",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatDateTime(item.date)}
                              </Typography>
                            </Tooltip>
                            <Tooltip title={item.billId} placement="top-start">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 900,
                                  color: "#7c3aed",
                                  fontSize: "0.75rem",
                                  fontFamily: "monospace",
                                  letterSpacing: "-0.01em",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  display: "block",
                                }}
                              >
                                {item.billId}
                              </Typography>
                            </Tooltip>
                            <Box sx={{ pt: 0.25 }}>
                              {renderStatusChip(item.billStatus)}
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* COLUMN 2 — Customer + Phone + Payment method stacked */}
                        <TableCell sx={{ py: 1.25 }}>
                          <Stack spacing={0.5}>
                            <Tooltip title={item.customer} placement="top-start">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  fontSize: "0.78rem",
                                  display: "block",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.customer}
                              </Typography>
                            </Tooltip>
                            {item.customerPhone && (
                              <Tooltip title={item.customerPhone} placement="top-start">
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    fontSize: "0.68rem",
                                    fontFamily: "monospace",
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.customerPhone}
                                </Typography>
                              </Tooltip>
                            )}
                            <Box>
                              <Chip
                                label={item.paymentMethod || "N/A"}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.62rem",
                                  fontWeight: 800,
                                  backgroundColor:
                                    item.paymentMethod === "Cash" ? "#ecfdf5" :
                                    item.paymentMethod === "Card" ? "#f5f3ff" :
                                    "#fff7ed",
                                  color:
                                    item.paymentMethod === "Cash" ? "#059669" :
                                    item.paymentMethod === "Card" ? "#6d28d9" :
                                    "#c2410c",
                                }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* COLUMN 3 — Tab-specific stacked attributes (all of them) */}
                        <TableCell sx={{ py: 1.25 }}>
                          {activeTab === "smartphone" && (
                            <Stack spacing={0.6}>
                              <Tooltip title={`${item.brand || ""} ${item.model || ""}`} placement="top-start">
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 900,
                                    color: "#1e293b",
                                    fontSize: "0.8rem",
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.brand || "—"} {item.model || "Unnamed"}
                                </Typography>
                              </Tooltip>
                              <Stack direction="row" spacing={0.6} useFlexGap sx={{ flexWrap: "wrap" }}>
                                <Chip
                                  label={item.type || "Unknown"}
                                  size="small"
                                  color={item.type === "Brand New" ? "primary" : "default"}
                                  sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800 }}
                                />
                                {item.storage && (
                                  <Chip
                                    label={item.storage}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: "0.6rem",
                                      fontWeight: 800,
                                      backgroundColor: "#eff6ff",
                                      color: "#1d4ed8",
                                    }}
                                  />
                                )}
                                {(item as any).color && (
                                  <Chip
                                    icon={<PaletteIcon sx={{ fontSize: "0.65rem !important", ml: 0.4 }} />}
                                    label={(item as any).color}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: "0.6rem",
                                      fontWeight: 800,
                                      backgroundColor: "#faf5ff",
                                      color: "#7e22ce",
                                    }}
                                  />
                                )}
                                {(item as any).batteryHealth != null && (
                                  <Chip
                                    icon={<BatteryChargingFullIcon sx={{ fontSize: "0.65rem !important", ml: 0.4 }} />}
                                    label={`${(item as any).batteryHealth}%`}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: "0.6rem",
                                      fontWeight: 800,
                                      backgroundColor:
                                        (item as any).batteryHealth >= 88 ? "#ecfdf5" :
                                        (item as any).batteryHealth >= 80 ? "#fffbeb" :
                                        "#fef2f2",
                                      color:
                                        (item as any).batteryHealth >= 88 ? "#059669" :
                                        (item as any).batteryHealth >= 80 ? "#b45309" :
                                        "#b91c1c",
                                    }}
                                  />
                                )}
                              </Stack>
                              {item.imei && (
                                <Tooltip title={`IMEI: ${item.imei}`} placement="top-start">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#059669",
                                      fontWeight: 700,
                                      fontFamily: "monospace",
                                      fontSize: "0.7rem",
                                      display: "block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    IMEI: {item.imei}
                                  </Typography>
                                </Tooltip>
                              )}
                            </Stack>
                          )}

                          {activeTab === "accessory" && (
                            <Stack spacing={0.6}>
                              <Tooltip title={item.name} placement="top-start">
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 900,
                                    color: "#1e293b",
                                    fontSize: "0.8rem",
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.name || "Unnamed Accessory"}
                                </Typography>
                              </Tooltip>
                              {(item.brand || item.model) && (
                                <Tooltip title={`${item.brand || ""} ${item.model || ""}`} placement="top-start">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontSize: "0.68rem",
                                      display: "block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.brand || ""} {item.model || ""}
                                  </Typography>
                                </Tooltip>
                              )}
                              <Stack direction="row" spacing={0.6} useFlexGap sx={{ flexWrap: "wrap" }}>
                                <Chip
                                  label={
                                    item.storage && item.storage.includes("•")
                                      ? item.storage.split("•")[0].trim()
                                      : (item.storage || "General")
                                  }
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: "0.6rem",
                                    fontWeight: 800,
                                    backgroundColor: "#fff7ed",
                                    color: "#ea580c",
                                  }}
                                />
                                <Chip
                                  icon={<GppGoodIcon sx={{ fontSize: "0.65rem !important", ml: 0.4 }} />}
                                  label={item.warranty || "No Warranty"}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: "0.6rem",
                                    fontWeight: 800,
                                    backgroundColor: item.warranty ? "#ecfdf5" : "#f8fafc",
                                    color: item.warranty ? "#059669" : "#64748b",
                                  }}
                                />
                              </Stack>
                            </Stack>
                          )}

                          {activeTab === "repair" && (
                            <Stack spacing={0.6}>
                              <Tooltip title={item.name} placement="top-start">
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 900,
                                    color: "#1e293b",
                                    fontSize: "0.8rem",
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.name || "Repair Service"}
                                </Typography>
                              </Tooltip>
                              {item.model && (
                                <Tooltip title={`Unit: ${item.model}`} placement="top-start">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontSize: "0.68rem",
                                      display: "block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Unit: {item.model}
                                  </Typography>
                                </Tooltip>
                              )}
                              <Stack direction="row" spacing={0.6} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
                                <Box
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.4,
                                    px: 0.75,
                                    py: 0.15,
                                    borderRadius: 1.5,
                                    fontSize: "0.6rem",
                                    fontWeight: 800,
                                    backgroundColor:
                                      item.storage?.includes("smartphone") || item.imei
                                        ? "#faf5ff"
                                        : "#ecfdf5",
                                    color:
                                      item.storage?.includes("smartphone") || item.imei
                                        ? "#7e22ce"
                                        : "#059669",
                                  }}
                                >
                                  {item.storage?.includes("smartphone") || item.imei ? (
                                    <SmartphoneIcon sx={{ fontSize: 11 }} />
                                  ) : (
                                    <LaptopMacIcon sx={{ fontSize: 11 }} />
                                  )}
                                  {item.brand || (
                                    (item.storage?.includes("smartphone") || item.imei
                                      ? "Phone"
                                      : "Device")
                                  )}
                                </Box>
                              </Stack>
                            </Stack>
                          )}
                        </TableCell>

                        {/* COLUMN 4 — Qty / Unit / Line Total (stacked right-aligned) */}
                        <TableCell sx={{ py: 1.25 }} align="right">
                          <Stack spacing={0.35} sx={{ alignItems: "flex-end" }}>
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                px: 1,
                                py: 0.15,
                                borderRadius: 1.25,
                                backgroundColor: "#f1f5f9",
                                color: "#334155",
                                fontWeight: 900,
                                fontSize: "0.68rem",
                                minWidth: 40,
                              }}
                            >
                              Qty: {item.qty}
                            </Box>
                            <Tooltip title={`Unit Price: ${formatCurrency(item.price)}`} placement="top-end">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                  textAlign: "right",
                                  display: "block",
                                }}
                              >
                                {formatCurrency(item.price)} each
                              </Typography>
                            </Tooltip>
                            <Tooltip
                              title={`Line Total: ${formatCurrency(item.price * item.qty)}`}
                              placement="top-end"
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 900,
                                  color: "#0f172a",
                                  fontSize: "0.92rem",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {formatCurrency(item.price * item.qty)}
                              </Typography>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px dashed #c4b5fd", backgroundColor: "#fafbff" }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 2, justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#6d28d9", textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                Filtered Summary
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700, mt: 0.5 }}>
                Showing <strong style={{ color: "#7c3aed" }}>{filteredItems.length}</strong> line items across{" "}
                <strong style={{ color: "#7c3aed" }}>{new Set(filteredItems.map((i) => i.billId)).size}</strong> invoices
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Total (Filtered)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#7c3aed" }}>
                  {formatCurrency(filteredItems.reduce((s, i) => s + i.price * i.qty, 0))}
                </Typography>
              </Box>
              <Divider orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Avg Invoice
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#059669" }}>
                  {formatCurrency(new Set(filteredItems.map((i) => i.billId)).size > 0
                    ? filteredItems.reduce((s, i) => s + (i.billTotal || i.price * i.qty), 0) / new Set(filteredItems.map((i) => i.billId)).size
                    : 0)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
