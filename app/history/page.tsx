"use client";

import { useEffect, useMemo, useState } from "react";
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
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import BuildIcon from "@mui/icons-material/Build";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import UndoIcon from "@mui/icons-material/Undo";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import {
  useHistory,
  HistoryEntry,
  HistoryAction,
  HistoryCategory,
} from "@/hooks/useHistory";
import { useBills } from "@/hooks/useBills";
import { useSmartphones } from "@/hooks/useSmartphones";
import { useAccessories } from "@/hooks/useAccessories";
import { useRepairs } from "@/hooks/useRepairs";

type OpTab = "smartphone" | "accessory" | "repair" | "bill";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (ts: any) => {
  if (!ts) return "N/A";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(ts);
  }
};

const actionConfig: Record<HistoryAction, { label: string; color: "primary" | "success" | "warning" | "error" | "info" | "default"; icon: React.ComponentType<any> }> = {
  create: { label: "Created", color: "success", icon: AddCircleIcon },
  update: { label: "Edited", color: "primary", icon: EditIcon },
  delete: { label: "Deleted", color: "error", icon: DeleteIcon },
  stock_add: { label: "Stock In", color: "success", icon: Inventory2Icon },
  stock_remove: { label: "Stock Out", color: "warning", icon: Inventory2Icon },
  sale: { label: "Sale", color: "success", icon: LocalAtmIcon },
  status_change: { label: "Status", color: "info", icon: SyncAltIcon },
  undo: { label: "Reversed", color: "warning", icon: UndoIcon },
  payment: { label: "Payment", color: "success", icon: PaymentsIcon },
  price_floor_update: { label: "Price Floor", color: "primary", icon: PriceChangeIcon },
};

const categoryCount = (entries: HistoryEntry[], cat: HistoryCategory | HistoryCategory[]) => {
  const cats = Array.isArray(cat) ? cat : [cat];
  return entries.filter((e) => cats.includes(e.category)).length;
};

export default function HistoryPage() {
  const { history, loading } = useHistory();
  const { bills } = useBills();
  const { smartphones } = useSmartphones();
  const { accessories } = useAccessories();
  const { repairs } = useRepairs();

  const [activeTab, setActiveTab] = useState<OpTab>("smartphone");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<HistoryAction | "all">("all");
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

  const tabToCategory: Record<OpTab, HistoryCategory[]> = {
    smartphone: ["smartphone", "stock"],
    accessory: ["accessory", "stock"],
    repair: ["repair"],
    bill: ["bill"],
  };

  const filteredEntries = useMemo(() => {
    const cats = tabToCategory[activeTab];
    return history.filter((entry) => {
      if (!cats.includes(entry.category)) return false;
      if (activeTab === "smartphone" && entry.category === "stock" && entry.payload?.type !== "smartphone") return false;
      if (activeTab === "accessory" && entry.category === "stock" && entry.payload?.type !== "accessory") return false;

      if (actionFilter !== "all" && entry.action !== actionFilter) return false;

      const searchLower = searchTerm.toLowerCase();
      if (searchTerm) {
        const haystack = [
          entry.entityLabel,
          entry.entityId,
          entry.userName,
          entry.description,
          JSON.stringify(entry.payload || {}),
          JSON.stringify(entry.oldValue || {}),
          JSON.stringify(entry.newValue || {}),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (dateFrom || dateTo) {
        try {
          const entryDate = new Date(entry.timestamp || 0);
          if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            if (entryDate < from) return false;
          }
          if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (entryDate > to) return false;
          }
        } catch {
          /* skip */
        }
      }
      return true;
    });
  }, [history, activeTab, searchTerm, actionFilter, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const cats = tabToCategory[activeTab];
    const tabEntries = history.filter((e) => cats.includes(e.category));
    const uniqueUsers = new Set(tabEntries.map((e) => e.userUid).filter(Boolean)).size;
    const createCount = tabEntries.filter((e) => e.action === "create").length;
    const editCount = tabEntries.filter((e) => e.action === "update" || e.action === "price_floor_update").length;
    const stockCount = tabEntries.filter((e) => e.action === "stock_add" || e.action === "stock_remove").length;
    return { total: tabEntries.length, uniqueUsers, createCount, editCount, stockCount };
  }, [history, activeTab]);

  const actionLabel = (action: HistoryAction) => actionConfig[action]?.label || action;
  const ActionIcon = (action: HistoryAction) => actionConfig[action]?.icon || DescriptionIcon;
  const actionColor = (action: HistoryAction) => actionConfig[action]?.color || "default";

  const exportCSV = () => {
    const headers = ["Timestamp", "Action", "Category", "Entity", "User", "Description", "Payload"];
    const rows = filteredEntries.map((e) => [
      formatDateTime(e.timestamp),
      e.action,
      e.category,
      e.entityLabel || e.entityId || "",
      e.userName || e.userUid || "",
      e.description || "",
      JSON.stringify(e.payload || {}),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-history-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderPayloadDetail = (entry: HistoryEntry) => {
    const payload = entry.payload || {};
    const entries = Object.entries(payload).filter(([k]) => k !== "type");
    if (entries.length === 0 && !entry.oldValue && !entry.newValue) return null;
    return (
      <Box sx={{ mt: 1 }}>
        {entries.length > 0 && (
          <Grid container spacing={1}>
            {entries.slice(0, 6).map(([k, v]) => (
              <Grid key={k} size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", fontSize: "0.62rem", letterSpacing: "0.04em" }}>
                  {k.replace(/([A-Z])/g, " $1").trim()}
                </Typography>
                <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600, display: "block", fontSize: "0.78rem" }}>
                  {typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}
        {(entry.oldValue || entry.newValue) && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed #e2e8f0" }}>
            <Grid container spacing={2}>
              {entry.oldValue && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#dc2626", textTransform: "uppercase", fontSize: "0.62rem" }}>
                    Before
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0.5,
                      p: 1.25,
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 1.5,
                      fontSize: "0.7rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "#991b1b",
                    }}
                  >
                    {typeof entry.oldValue === "string" ? entry.oldValue : JSON.stringify(entry.oldValue, null, 2).slice(0, 400)}
                  </Box>
                </Grid>
              )}
              {entry.newValue && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#059669", textTransform: "uppercase", fontSize: "0.62rem" }}>
                    After
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0.5,
                      p: 1.25,
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: 1.5,
                      fontSize: "0.7rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "#065f46",
                    }}
                  >
                    {typeof entry.newValue === "string" ? entry.newValue : JSON.stringify(entry.newValue, null, 2).slice(0, 400)}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    );
  };

  const phoneOpsCount = categoryCount(history, ["smartphone", "stock"]);
  const accOpsCount = categoryCount(history, ["accessory", "stock"]);
  const repairOpsCount = categoryCount(history, ["repair"]);
  const billOpsCount = categoryCount(history, ["bill"]);

  const uniqueActions: (HistoryAction | "all")[] = [
    "all",
    ...Array.from(new Set(history.map((e) => e.action))) as HistoryAction[],
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", py: 2.5 }}>
      <Container maxWidth="xl">
        {slotMounted &&
          createPortal(
            <Tooltip title="Export filtered results">
              <Button
                size="small"
                variant="outlined"
                startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
                onClick={exportCSV}
                disabled={filteredEntries.length === 0}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: "#6ee7b7",
                  color: "#059669",
                  backgroundColor: "#ecfdf5",
                  whiteSpace: "nowrap",
                  "&:hover": { backgroundColor: "#d1fae5", borderColor: "#059669" },
                }}
              >
                Export Audit Log
              </Button>
            </Tooltip>,
            document.getElementById("topbar-export-slot") as HTMLElement
          )}

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#ecfdf5", color: "#059669" }}>
                  <ReceiptLongIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Total Events
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {summary.total}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                {activeTab === "smartphone" ? "smartphone operations" :
                 activeTab === "accessory" ? "accessory operations" :
                 activeTab === "repair" ? "repair operations" : "billing operations"}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#dcfce7", color: "#16a34a" }}>
                  <AddCircleIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Created
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#16a34a" }}>
                {summary.createCount}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                items added
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#ede9fe", color: "#7c3aed" }}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Edited / Updated
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#7c3aed" }}>
                {summary.editCount}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                record modifications
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "#fff7ed", color: "#ea580c" }}>
                  <Inventory2Icon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Stock Moves
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#ea580c" }}>
                {summary.stockCount}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                by {summary.uniqueUsers || 0} unique users
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ borderRadius: 3, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              px: 2,
              pt: 1,
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: "#fafaf9",
              "& .MuiTabs-indicator": { backgroundColor: "#059669", height: 3 },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.95rem", color: "#64748b", minHeight: 56 },
              "& .Mui-selected": { color: "#059669" },
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
                    label={phoneOpsCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "smartphone" ? "#bbf7d0" : "#e2e8f0",
                      color: activeTab === "smartphone" ? "#15803d" : "#475569",
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
                    label={accOpsCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "accessory" ? "#bbf7d0" : "#e2e8f0",
                      color: activeTab === "accessory" ? "#15803d" : "#475569",
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
                    label={repairOpsCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "repair" ? "#bbf7d0" : "#e2e8f0",
                      color: activeTab === "repair" ? "#15803d" : "#475569",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="bill"
              icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Billing / Invoices
                  <Chip
                    label={billOpsCount}
                    size="small"
                    sx={{
                      height: 20, fontSize: "0.68rem", fontWeight: 800,
                      backgroundColor: activeTab === "bill" ? "#bbf7d0" : "#e2e8f0",
                      color: activeTab === "bill" ? "#15803d" : "#475569",
                    }}
                  />
                </Box>
              }
            />
          </Tabs>

          <Box sx={{ p: 3, backgroundColor: "#fafaf9", borderBottom: "1px solid #f1f5f9" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by entity, user, description, payload..."
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
              <Grid size={{ xs: 6, md: 2 }}>
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
              <Grid size={{ xs: 6, md: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Action Filter"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as any)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    select: {
                      native: true,
                      sx: { backgroundColor: "#ffffff", borderRadius: 2, "& .MuiNativeSelect-select": { backgroundColor: "#ffffff", borderRadius: 2, py: 1 } },
                    },
                  }}
                >
                  {uniqueActions.map((a) => (
                    <option key={a} value={a}>
                      {a === "all" ? "All Actions" : actionLabel(a as HistoryAction)}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                {(dateFrom || dateTo || searchTerm || actionFilter !== "all") && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => { setDateFrom(""); setDateTo(""); setSearchTerm(""); setActionFilter("all"); }}
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
                    Reset All
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#059669" }} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: "calc(100vh - 380px)", overflow: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 160 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Action</TableCell>

                    {activeTab === "smartphone" && (
                      <>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 200 }}>Smartphone / Stock</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Details</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Variants / IMEI</TableCell>
                      </>
                    )}
                    {activeTab === "accessory" && (
                      <>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 200 }}>Accessory Item</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Stock / Specs</TableCell>
                      </>
                    )}
                    {activeTab === "repair" && (
                      <>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 160 }}>Device</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 180 }}>Repair Type</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Customer</TableCell>
                      </>
                    )}
                    {activeTab === "bill" && (
                      <>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Invoice</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 160 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Amount</TableCell>
                      </>
                    )}

                    <TableCell sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2 }}>Performed By</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", backgroundColor: "#f8fafc", py: 2, minWidth: 60 }}>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 64, height: 64, borderRadius: 3,
                              backgroundColor: "#f1f5f9", color: "#94a3b8",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <AccountTreeIcon sx={{ fontSize: 32 }} />
                          </Box>
                          <Typography variant="body1" sx={{ color: "#475569", fontWeight: 700 }}>
                            No audit records found for{" "}
                            {activeTab === "smartphone" ? "smartphones" :
                             activeTab === "accessory" ? "accessories" :
                             activeTab === "repair" ? "repairs" : "billing"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, maxWidth: 440 }}>
                            Operations will appear here automatically as your team adds, edits, sells, or manages inventory and invoices.
                            Try clearing filters to see all events, or create a new record from the main pages.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => {
                      const payload = entry.payload || {};
                      const Icon = ActionIcon(entry.action);
                      return (
                        <TableRow
                          key={entry.id || entry.timestamp + entry.entityId}
                          hover
                          sx={{ verticalAlign: "top" }}
                        >
                          <TableCell sx={{ color: "#475569", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap", py: 2 }}>
                            {formatDateTime(entry.timestamp)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              icon={<Icon sx={{ fontSize: "14px !important" }} />}
                              label={actionLabel(entry.action)}
                              size="small"
                              color={actionColor(entry.action)}
                              variant="outlined"
                              sx={{ height: 24, fontSize: "0.7rem", fontWeight: 700 }}
                            />
                          </TableCell>

                          {activeTab === "smartphone" && (
                            <>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>
                                  {entry.entityLabel || payload.brand || payload.model || payload.product || entry.entityId || "Smartphone"}
                                </Typography>
                                {(payload.brand || payload.model) && !entry.entityLabel && (
                                  <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                                    {payload.brand || ""} {payload.model || ""}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2, fontSize: "0.8rem", color: "#334155" }}>
                                <Stack spacing={0.5}>
                                  {payload.storage && (
                                    <Chip label={payload.storage} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                                  )}
                                  {payload.category && (
                                    <Chip label={payload.category} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, textTransform: "capitalize" }} />
                                  )}
                                  {payload.qty && (
                                    <Chip label={`${payload.qty} units`} size="small" color="info" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
                                  )}
                                  {entry.description && (
                                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                                      {entry.description}
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                {payload.imei && (
                                  <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#059669", fontWeight: 700, fontSize: "0.75rem", display: "block" }}>
                                    IMEI: {payload.imei}
                                  </Typography>
                                )}
                                {payload.stockCount && (
                                  <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, display: "block", fontSize: "0.75rem" }}>
                                    Stock: {payload.stockCount}
                                  </Typography>
                                )}
                                {typeof payload.price === "number" && (
                                  <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 700, display: "block", fontSize: "0.75rem" }}>
                                    {formatCurrency(payload.price)}
                                  </Typography>
                                )}
                                {payload.variants && Array.isArray(payload.variants) && (
                                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", display: "block" }}>
                                    {payload.variants.length} variant(s)
                                  </Typography>
                                )}
                              </TableCell>
                            </>
                          )}

                          {activeTab === "accessory" && (
                            <>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>
                                  {entry.entityLabel || payload.name || payload.product || entry.entityId || "Accessory"}
                                </Typography>
                                {payload.brand && (
                                  <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                                    {payload.brand}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Chip
                                  label={payload.category || "General"}
                                  size="small"
                                  sx={{
                                    height: 20, fontSize: "0.68rem", fontWeight: 700,
                                    backgroundColor: "#fff7ed", color: "#ea580c", textTransform: "capitalize",
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                {payload.specifications && (
                                  <Chip label={payload.specifications} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, mb: 0.5 }} />
                                )}
                                {typeof payload.quantity === "number" && (
                                  <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 800, fontSize: "0.75rem", display: "block" }}>
                                    +{payload.quantity} units
                                  </Typography>
                                )}
                                {typeof payload.price === "number" && (
                                  <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 700, fontSize: "0.75rem", display: "block" }}>
                                    {formatCurrency(payload.price)}
                                  </Typography>
                                )}
                                {entry.description && (
                                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", display: "block", mt: 0.5 }}>
                                    {entry.description}
                                  </Typography>
                                )}
                              </TableCell>
                            </>
                          )}

                          {activeTab === "repair" && (
                            <>
                              <TableCell sx={{ py: 2 }}>
                                <Stack spacing={0.25}>
                                  <Chip
                                    label={payload.deviceType || "device"}
                                    size="small"
                                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, textTransform: "capitalize" }}
                                  />
                                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                                    {payload.brand || ""} {payload.model || ""}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>
                                  {entry.entityLabel || payload.repairType || "Repair Service"}
                                </Typography>
                                {typeof payload.price === "number" && (
                                  <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 700, display: "block", fontSize: "0.75rem" }}>
                                    {formatCurrency(payload.price)}
                                  </Typography>
                                )}
                                {entry.description && (
                                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", display: "block", mt: 0.5 }}>
                                    {entry.description}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                {payload.customerName && (
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>
                                    {payload.customerName}
                                  </Typography>
                                )}
                                {(payload.customerPhone || payload.customerWhatsapp) && (
                                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>
                                    {payload.customerPhone || payload.customerWhatsapp}
                                  </Typography>
                                )}
                                {payload.status && (
                                  <Chip
                                    label={payload.status}
                                    size="small"
                                    color={payload.status === "completed" ? "success" : payload.status === "in-progress" ? "primary" : "warning"}
                                    sx={{ mt: 0.5, height: 18, fontSize: "0.65rem", fontWeight: 700, textTransform: "capitalize" }}
                                  />
                                )}
                              </TableCell>
                            </>
                          )}

                          {activeTab === "bill" && (
                            <>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.82rem", fontFamily: "monospace" }}>
                                  {entry.entityId || payload.billId || payload.id || "—"}
                                </Typography>
                                {payload.status && (
                                  <Chip
                                    label={payload.status}
                                    size="small"
                                    color={payload.status === "Paid" ? "success" : payload.status === "Undone" ? "error" : payload.status === "Partial" ? "warning" : "info"}
                                    sx={{ mt: 0.5, height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>
                                  {entry.entityLabel || payload.customer || "—"}
                                </Typography>
                                {payload.phone && (
                                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>
                                    {payload.phone}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                {typeof payload.total === "number" && (
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem", textAlign: "right" }}>
                                    {formatCurrency(payload.total)}
                                  </Typography>
                                )}
                                {payload.paymentMethod && (
                                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", display: "block", textAlign: "right" }}>
                                    {payload.paymentMethod}
                                  </Typography>
                                )}
                                {typeof payload.itemCount === "number" && (
                                  <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, fontSize: "0.72rem", display: "block", textAlign: "right" }}>
                                    {payload.itemCount} items
                                  </Typography>
                                )}
                              </TableCell>
                            </>
                          )}

                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <PersonIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: "#334155", fontWeight: 700, display: "block", fontSize: "0.78rem" }}>
                                  {entry.userName || entry.userRole || "System"}
                                </Typography>
                                {entry.userUid && (
                                  <Typography variant="caption" sx={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "0.65rem" }}>
                                    {entry.userUid.slice(0, 8)}…
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            {(Object.keys(payload).length > 0 || entry.oldValue || entry.newValue) && (
                              <Tooltip title="Expand for payload / before / after details">
                                <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px dashed #6ee7b7", backgroundColor: "#f0fdf4", mb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 2, justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                Live Snapshot
              </Typography>
              <Typography variant="body2" sx={{ color: "#166534", fontWeight: 700, mt: 0.5 }}>
                Filtered: <strong style={{ color: "#059669" }}>{filteredEntries.length}</strong> events •{" "}
                Live Inventory: {smartphones.length} phone models, {accessories.length} accessories, {repairs.length} repair tickets, {bills.length} invoices
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "#15803d", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem" }}>
                  Filtered Records
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#059669" }}>
                  {filteredEntries.length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {filteredEntries.length > 0 && (
          <Paper sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden" }}>
            <Accordion disableGutters sx={{ "&:before": { display: "none" } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#059669" }} />}
                sx={{ px: 3, backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DescriptionIcon sx={{ color: "#059669", fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Inspect First 5 Filtered Records (Payload & Diff)
                  </Typography>
                  <Chip label={`${Math.min(filteredEntries.length, 5)} shown`} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, backgroundColor: "#dcfce7", color: "#166534" }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, backgroundColor: "#fcfcfc" }}>
                <Stack spacing={2}>
                  {filteredEntries.slice(0, 5).map((entry, idx) => (
                    <Paper key={entry.id || idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#e2e8f0" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Chip
                            label={`#${idx + 1}`}
                            size="small"
                            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 800, backgroundColor: "#059669", color: "#ffffff" }}
                          />
                          <Chip
                            icon={(() => { const I = ActionIcon(entry.action); return <I sx={{ fontSize: "13px !important" }} />; })()}
                            label={actionLabel(entry.action)}
                            size="small"
                            color={actionColor(entry.action)}
                            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                          />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.72rem" }}>
                            {formatDateTime(entry.timestamp)}
                          </Typography>
                        </Box>
                        <Chip
                          label={entry.category}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, textTransform: "capitalize", color: "#6d28d9", borderColor: "#c4b5fd" }}
                        />
                      </Box>
                      {renderPayloadDetail(entry)}
                    </Paper>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
