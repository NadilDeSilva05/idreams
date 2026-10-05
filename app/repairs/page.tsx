"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Grid,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonIcon from "@mui/icons-material/Person";
import { Repair } from "@/types/repair";
import AddRepairModal from "@/components/repairs/AddRepairModal";
import { useCart } from "@/context/cart-context";
import { PersistentCart } from "@/components/cart/persistent-cart";
import { useRepairs } from "@/hooks/useRepairs";
import { useAuth } from "@/context/auth-context";
import { generatePickupMessage, getWhatsAppShareUrl } from "@/lib/whatsapp";
import CircularProgress from "@mui/material/CircularProgress";

const toTimestamp = (date: any): number => {
  if (!date) return 0;
  if (date instanceof Date) return date.getTime();
  if (typeof date.toMillis === "function") return date.toMillis();
  if (typeof date.toDate === "function") return date.toDate().getTime();
  return new Date(date).getTime() || 0;
};

const formatDate = (date: any): string => {
  if (!date) return "N/A";
  if (date instanceof Date) {
    return date.toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" });
  }
  if (typeof date.toDate === "function") {
    return date.toDate().toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" });
  }
  return new Date(date).toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" });
};

export default function RepairsPage() {
  const { addToCart } = useCart();
  const { isOwner } = useAuth();
  const { repairs, loading, addRepair, updateRepair, deleteRepair } = useRepairs();
  const [openModal, setOpenModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);

  // Add to cart modal state
  const [selectedRepairForCart, setSelectedRepairForCart] = useState<Repair | null>(null);
  const [repairCartPrice, setRepairCartPrice] = useState("");

  // WhatsApp notification modal state
  const [whatsAppModalRepair, setWhatsAppModalRepair] = useState<Repair | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<"all" | "smartphone" | "laptop">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-high" | "price-low">("newest");

  const generateId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `REP-${timestamp}-${random}`.toUpperCase();
  };

  const handleAddRepair = async (repairData: Omit<Repair, "id" | "dateCreated">) => {
    if (editingRepair?.id) {
      await updateRepair(editingRepair.id, repairData);
      if (repairData.status === "completed" && (repairData.customerWhatsapp || repairData.customerPhone)) {
        setWhatsAppModalRepair({ ...repairData, id: editingRepair.id, dateCreated: editingRepair.dateCreated });
      }
      setEditingRepair(null);
    } else {
      const newRepair: Repair = {
        ...repairData,
        dateCreated: new Date(),
      };
      await addRepair(newRepair);
      if (repairData.status === "completed" && (repairData.customerWhatsapp || repairData.customerPhone)) {
        setWhatsAppModalRepair(newRepair);
      }
    }
    setOpenModal(false);
  };

  const handleStatusChange = async (repair: Repair, newStatus: "pending" | "in-progress" | "completed") => {
    if (!repair.id) return;
    await updateRepair(repair.id, { status: newStatus });
    if (newStatus === "completed" && (repair.customerWhatsapp || repair.customerPhone)) {
      setWhatsAppModalRepair({ ...repair, status: newStatus });
    }
  };

  const handleDeleteRepair = async (id?: string) => {
    if (!id) return;
    await deleteRepair(id);
  };

  const handleEditRepair = (repair: Repair) => {
    setEditingRepair(repair);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingRepair(null);
  };

  const handleOpenCartDialog = (repair: Repair) => {
    setSelectedRepairForCart(repair);
    setRepairCartPrice(String(repair.price));
  };

  const handleAddToCart = () => {
    if (!selectedRepairForCart) return;

    const priceValue = Number(repairCartPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return;

    addToCart({
      brand: selectedRepairForCart.brand
        ? `${selectedRepairForCart.brand} Repair`
        : selectedRepairForCart.deviceType === "smartphone"
          ? "Smartphone Repair"
          : "Laptop Repair",
      model: `${selectedRepairForCart.model} (${selectedRepairForCart.repairType})`,
      storage: `Ticket: ${selectedRepairForCart.id}${selectedRepairForCart.storage ? ` • ${selectedRepairForCart.storage}` : ""}`,
      price: priceValue,
    });

    setSelectedRepairForCart(null);
    setRepairCartPrice("");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDeviceTypeFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  // Filter and sort repairs
  const filteredRepairs = repairs
    .filter((repair) => {
      const matchesSearch =
        !searchTerm ||
        (repair.id ? repair.id.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        repair.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repair.brand && repair.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        repair.repairType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repair.customerName && repair.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (repair.customerWhatsapp && repair.customerWhatsapp.includes(searchTerm)) ||
        (repair.customerPhone && repair.customerPhone.includes(searchTerm));

      const matchesDevice = deviceTypeFilter === "all" || repair.deviceType === deviceTypeFilter;
      const matchesStatus = statusFilter === "all" || repair.status === statusFilter;

      return matchesSearch && matchesDevice && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return toTimestamp(b.dateCreated) - toTimestamp(a.dateCreated);
      }
      if (sortBy === "oldest") {
        return toTimestamp(a.dateCreated) - toTimestamp(b.dateCreated);
      }
      if (sortBy === "price-high") {
        return b.price - a.price;
      }
      if (sortBy === "price-low") {
        return a.price - b.price;
      }
      return 0;
    });

  const counts = {
    all: repairs.length,
    pending: repairs.filter((r) => r.status === "pending").length,
    inProgress: repairs.filter((r) => r.status === "in-progress").length,
    completed: repairs.filter((r) => r.status === "completed").length,
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Container maxWidth="xl" sx={{ py: 2.5 }}>
          {/* Filter & Action Section */}
          <Paper
            sx={{
              p: 2.25,
              mb: 4,
              border: "1px solid #e2e8f0",
              borderRadius: 2.5,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
            }}
          >
            {/* Header & Add Repair Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterAltIcon sx={{ color: "#7c3aed", fontSize: 22 }} />
                  Filter & Search Repair Tickets
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Filter by device type, repair status, or search model and job details
                </Typography>
              </Box>

              {/* Moved Add Repair Button Here */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingRepair(null);
                  setOpenModal(true);
                }}
                sx={{
                  background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                  fontWeight: 700,
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #6d28d9, #c2410c)",
                  },
                }}
              >
                Add Repair Ticket
              </Button>
            </Box>

            {/* Quick Status Filter Chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              <Chip
                label={`All (${counts.all})`}
                clickable
                onClick={() => setStatusFilter("all")}
                sx={{
                  fontWeight: 700,
                  backgroundColor: statusFilter === "all" ? "#7c3aed" : "#f1f5f9",
                  color: statusFilter === "all" ? "#ffffff" : "#475569",
                  "&:hover": {
                    backgroundColor: statusFilter === "all" ? "#6d28d9" : "#e2e8f0",
                  },
                }}
              />
              <Chip
                icon={<HourglassEmptyIcon sx={{ fontSize: "16px !important", color: statusFilter === "pending" ? "#ffffff !important" : "#64748b !important" }} />}
                label={`Pending (${counts.pending})`}
                clickable
                onClick={() => setStatusFilter("pending")}
                sx={{
                  fontWeight: 700,
                  backgroundColor: statusFilter === "pending" ? "#64748b" : "#f8fafc",
                  color: statusFilter === "pending" ? "#ffffff" : "#64748b",
                  border: "1px solid #cbd5e1",
                  "&:hover": {
                    backgroundColor: statusFilter === "pending" ? "#475569" : "#f1f5f9",
                  },
                }}
              />
              <Chip
                icon={<AutorenewIcon sx={{ fontSize: "16px !important", color: statusFilter === "in-progress" ? "#ffffff !important" : "#b45309 !important" }} />}
                label={`In Progress (${counts.inProgress})`}
                clickable
                onClick={() => setStatusFilter("in-progress")}
                sx={{
                  fontWeight: 700,
                  backgroundColor: statusFilter === "in-progress" ? "#d97706" : "#fffbeb",
                  color: statusFilter === "in-progress" ? "#ffffff" : "#b45309",
                  border: "1px solid #fde68a",
                  "&:hover": {
                    backgroundColor: statusFilter === "in-progress" ? "#b45309" : "#fef3c7",
                  },
                }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: "16px !important", color: statusFilter === "completed" ? "#ffffff !important" : "#065f46 !important" }} />}
                label={`Completed (${counts.completed})`}
                clickable
                onClick={() => setStatusFilter("completed")}
                sx={{
                  fontWeight: 700,
                  backgroundColor: statusFilter === "completed" ? "#059669" : "#ecfdf5",
                  color: statusFilter === "completed" ? "#ffffff" : "#065f46",
                  border: "1px solid #a7f3d0",
                  "&:hover": {
                    backgroundColor: statusFilter === "completed" ? "#047857" : "#d1fae5",
                  },
                }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Filter Controls Row */}
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              {/* Search text */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Repairs"
                  placeholder="ID, model, brand, repair type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#64748b", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Device Type filter */}
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={deviceTypeFilter}
                    label="Device Type"
                    onChange={(e) => setDeviceTypeFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">All Devices</MenuItem>
                    <MenuItem value="smartphone">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <SmartphoneIcon sx={{ fontSize: 18, color: "#7c3aed" }} /> Smartphone
                      </Box>
                    </MenuItem>
                    <MenuItem value="laptop">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LaptopMacIcon sx={{ fontSize: 18, color: "#7c3aed" }} /> Laptop
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status filter */}
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <HourglassEmptyIcon sx={{ fontSize: 18, color: "#64748b" }} /> Pending
                      </Box>
                    </MenuItem>
                    <MenuItem value="in-progress">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AutorenewIcon sx={{ fontSize: 18, color: "#d97706" }} /> In Progress
                      </Box>
                    </MenuItem>
                    <MenuItem value="completed">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: "#059669" }} /> Completed
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Reset Filters */}
              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="medium"
                  onClick={handleResetFilters}
                  startIcon={<RestartAltIcon />}
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#64748b",
                    textTransform: "none",
                    height: 40,
                    "&:hover": {
                      borderColor: "#94a3b8",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Summary */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#475569" }}>
              Showing {filteredRepairs.length} of {repairs.length} repair tickets
            </Typography>
          </Box>

          {/* Loading Spinner */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#7c3aed" }} />
            </Box>
          )}

          {/* Table of Repairs */}
          {!loading && filteredRepairs.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#f8fafc",
                borderRadius: 2.5,
              }}
            >
              <SearchOffIcon sx={{ fontSize: 44, color: "#94a3b8", mb: 1 }} />
              <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
                No repair tickets match your filters
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                Try adjusting your search keywords or resetting the filter options.
              </Typography>
              <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleResetFilters} sx={{ textTransform: "none" }}>
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredRepairs.map((repair) => {
                const isCompleted = repair.status === "completed";
                const isInProgress = repair.status === "in-progress";
                const statusBg = isCompleted ? "#dcfce7" : isInProgress ? "#fef3c7" : "#f1f5f9";
                const statusText = isCompleted ? "#15803d" : isInProgress ? "#b45309" : "#475569";
                const statusBorder = isCompleted ? "#86efac" : isInProgress ? "#fde68a" : "#cbd5e1";
                const hasPhone = Boolean(repair.customerWhatsapp || repair.customerPhone);

                return (
                  <Grid key={repair.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRadius: 3,
                        backgroundColor: "#ffffff",
                        border: "1.5px solid",
                        borderColor: isCompleted ? "#bbf7d0" : "#e2e8f0",
                        boxShadow: isCompleted
                          ? "0 4px 18px rgba(34, 197, 94, 0.08)"
                          : "0 4px 15px rgba(0, 0, 0, 0.03)",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 12px 28px rgba(124, 58, 237, 0.09)",
                          borderColor: isCompleted ? "#22c55e" : "#c4b5fd",
                        },
                      }}
                    >
                      {/* Top colored accent indicator line */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          backgroundColor: isCompleted ? "#22c55e" : isInProgress ? "#f59e0b" : "#94a3b8",
                        }}
                      />

                      <Box>
                        {/* Header: Ticket ID & Status Selector */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, mt: 0.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#7c3aed",
                              fontFamily: "monospace",
                              fontSize: "0.82rem",
                              backgroundColor: "#f5f3ff",
                              px: 1,
                              py: 0.35,
                              borderRadius: 1.5,
                              border: "1px solid #ddd6fe",
                            }}
                          >
                            {repair.id}
                          </Typography>

                          {/* Quick Status Dropdown */}
                          <FormControl size="small" variant="standard">
                            <Select
                              value={repair.status}
                              onChange={(e) => handleStatusChange(repair, e.target.value as any)}
                              disableUnderline
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.78rem",
                                borderRadius: 2,
                                px: 1.2,
                                py: 0.35,
                                border: `1px solid ${statusBorder}`,
                                backgroundColor: statusBg,
                                color: statusText,
                                "& .MuiSelect-icon": { color: statusText },
                              }}
                            >
                              <MenuItem value="pending" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                Pending
                              </MenuItem>
                              <MenuItem value="in-progress" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                In Progress
                              </MenuItem>
                              <MenuItem value="completed" sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534" }}>
                                Completed ✓
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        {/* Device Info */}
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2.5,
                              backgroundColor: repair.deviceType === "smartphone" ? "#f5f3ff" : "#eff6ff",
                              color: repair.deviceType === "smartphone" ? "#7c3aed" : "#2563eb",
                              border: `1px solid ${repair.deviceType === "smartphone" ? "#ddd6fe" : "#bfdbfe"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {repair.deviceType === "smartphone" ? (
                              <SmartphoneIcon sx={{ fontSize: 24 }} />
                            ) : (
                              <LaptopMacIcon sx={{ fontSize: 24 }} />
                            )}
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem", lineHeight: 1.25, mb: 0.5 }}>
                              {repair.brand ? `${repair.brand} ` : ""}
                              {repair.model}
                            </Typography>
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                              {repair.storage && (
                                <Chip
                                  label={repair.storage}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, borderColor: "#cbd5e1" }}
                                />
                              )}
                              <Chip
                                label={repair.repairType}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  backgroundColor: "#f1f5f9",
                                  color: "#334155",
                                }}
                              />
                            </Stack>
                          </Box>
                        </Box>

                        {/* Customer & WhatsApp Section */}
                        <Box
                          sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: "#1e293b",
                                fontSize: "0.88rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 17, color: "#64748b" }} />
                              {repair.customerName || "Walk-in Customer"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                              {formatDate(repair.dateCreated)}
                            </Typography>
                          </Box>

                          {hasPhone ? (
                            <Chip
                              icon={<WhatsAppIcon sx={{ fontSize: "15px !important", color: "#25D366 !important" }} />}
                              label={repair.customerWhatsapp || repair.customerPhone}
                              size="small"
                              clickable
                              onClick={() => setWhatsAppModalRepair(repair)}
                              title="Click to send WhatsApp pickup message"
                              sx={{
                                height: 24,
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                fontFamily: "monospace",
                                backgroundColor: "#f0fdf4",
                                color: "#166534",
                                border: "1px solid #bbf7d0",
                                "&:hover": { backgroundColor: "#dcfce7" },
                              }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                              No WhatsApp number provided
                            </Typography>
                          )}
                        </Box>

                        {/* Price Badge */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                            Service Charge:
                          </Typography>
                          <Typography sx={{ fontWeight: 900, color: "#059669", fontSize: "1.2rem" }}>
                            Rs. {repair.price.toLocaleString("en-LK")}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          {/* WhatsApp Button */}
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setWhatsAppModalRepair(repair)}
                            sx={{
                              backgroundColor: "#25D366",
                              color: "#ffffff",
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "0.78rem",
                              py: 0.65,
                              borderRadius: 1.5,
                              boxShadow: "0 2px 6px rgba(37, 211, 102, 0.25)",
                              "&:hover": { backgroundColor: "#1fad52" },
                            }}
                          >
                            WhatsApp
                          </Button>

                          {/* Add to Cart Button */}
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            startIcon={<AddShoppingCartIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleOpenCartDialog(repair)}
                            sx={{
                              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "0.78rem",
                              py: 0.65,
                              borderRadius: 1.5,
                              boxShadow: "0 2px 6px rgba(124, 58, 237, 0.2)",
                              whiteSpace: "nowrap",
                              "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                            }}
                          >
                            Cart
                          </Button>

                          {/* Edit Icon Button */}
                          <IconButton
                            size="small"
                            onClick={() => handleEditRepair(repair)}
                            title="Edit Repair"
                            sx={{
                              border: "1px solid #cbd5e1",
                              borderRadius: 1.5,
                              color: "#475569",
                              p: 0.7,
                              "&:hover": { backgroundColor: "#f1f5f9", borderColor: "#94a3b8" },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>

                          {/* Delete Icon Button — Owner only */}
                          {isOwner && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRepair(repair.id)}
                            title="Delete Repair"
                            sx={{
                              border: "1px solid #fecaca",
                              borderRadius: 1.5,
                              color: "#ef4444",
                              p: 0.7,
                              "&:hover": { backgroundColor: "#fee2e2", borderColor: "#f87171" },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          )}
                        </Stack>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          <AddRepairModal
            open={openModal}
            onClose={handleCloseModal}
            onSubmit={handleAddRepair}
            initialData={editingRepair}
          />

          {/* Add Repair Ticket to Cart Dialog */}
          <Dialog
            open={Boolean(selectedRepairForCart)}
            onClose={() => setSelectedRepairForCart(null)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 3,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                },
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 800, color: "#7c3aed", display: "flex", alignItems: "center", gap: 1 }}>
              <AddShoppingCartIcon sx={{ color: "#7c3aed" }} />
              Add Repair Ticket to Cart
            </DialogTitle>
            <DialogContent dividers sx={{ py: 2.5 }}>
              {selectedRepairForCart && (
                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#f5f3ff",
                      borderRadius: 2,
                      border: "1px solid #ddd6fe",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, fontFamily: "monospace" }}>
                      {selectedRepairForCart.id}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1.05rem", mt: 0.25 }}>
                      {selectedRepairForCart.brand ? `${selectedRepairForCart.brand} ` : ""}
                      {selectedRepairForCart.model}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                      Service: <strong>{selectedRepairForCart.repairType}</strong>
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                      Billable Price in LKR
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Price in LKR"
                      value={repairCartPrice}
                      onChange={(e) => setRepairCartPrice(e.target.value)}
                      slotProps={{ htmlInput: { min: 0, step: 1 } }}
                      helperText="Default repair price pre-filled. You can adjust the final amount before billing."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          "&.Mui-focused fieldset": {
                            borderColor: "#7c3aed",
                          },
                        },
                      }}
                    />
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={() => setSelectedRepairForCart(null)}
                sx={{ fontWeight: 600, textTransform: "none", color: "#64748b" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={!repairCartPrice || Number(repairCartPrice) <= 0}
                startIcon={<AddShoppingCartIcon />}
                sx={{
                  background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 2,
                  borderRadius: 1.5,
                  "&:hover": {
                    background: "linear-gradient(135deg, #6d28d9, #c2410c)",
                  },
                }}
              >
                Add to Cart
              </Button>
            </DialogActions>
          </Dialog>

          {/* WhatsApp Pickup Notification Dialog */}
          <Dialog
            open={Boolean(whatsAppModalRepair)}
            onClose={() => setWhatsAppModalRepair(null)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 3,
                  boxShadow: "0 20px 45px rgba(37, 211, 102, 0.22)",
                },
              },
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 800,
                fontSize: "1.15rem",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderBottom: "1px solid #e2e8f0",
                pb: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(37, 211, 102, 0.35)",
                  flexShrink: 0,
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e293b", lineHeight: 1.2 }}>
                  Device Ready — WhatsApp Pickup Alert
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Send a ready-for-pickup notice directly to the customer on WhatsApp
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {whatsAppModalRepair && (
                <Stack spacing={2}>
                  {/* Customer and Contact Details Cards */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 1.75, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                          CUSTOMER NAME
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.98rem" }}>
                          {whatsAppModalRepair.customerName || "Customer"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 1.75, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                          WHATSAPP NUMBER
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "0.98rem", fontFamily: "monospace" }}>
                          {whatsAppModalRepair.customerWhatsapp || whatsAppModalRepair.customerPhone || "No number provided"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Device and Service Summary */}
                  <Box sx={{ p: 1.5, backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, display: "block" }}>
                      DEVICE & SERVICE
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem" }}>
                      {whatsAppModalRepair.brand ? `${whatsAppModalRepair.brand} ` : ""}
                      {whatsAppModalRepair.model} ({whatsAppModalRepair.repairType})
                    </Typography>
                  </Box>

                  {/* Generated WhatsApp Message */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569", display: "block", mb: 0.75 }}>
                      GENERATED MESSAGE:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: "#f0fdf4",
                        border: "1.5px solid #86efac",
                        borderRadius: 2,
                        position: "relative",
                      }}
                    >
                      <Typography sx={{ color: "#166534", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.6 }}>
                        "{generatePickupMessage(whatsAppModalRepair)}"
                      </Typography>
                    </Paper>
                  </Box>

                  {!(whatsAppModalRepair.customerWhatsapp || whatsAppModalRepair.customerPhone) && (
                    <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700 }}>
                      ⚠️ No WhatsApp number was recorded for this ticket. You can edit the ticket to add the customer's phone number.
                    </Typography>
                  )}
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0", gap: 1 }}>
              <Button
                onClick={() => setWhatsAppModalRepair(null)}
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600, color: "#64748b" }}
              >
                Close
              </Button>

              {whatsAppModalRepair && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    const msg = generatePickupMessage(whatsAppModalRepair);
                    navigator.clipboard.writeText(msg);
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2500);
                  }}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  {copiedMessage ? "Copied!" : "Copy Text"}
                </Button>
              )}

              {whatsAppModalRepair && (whatsAppModalRepair.customerWhatsapp || whatsAppModalRepair.customerPhone) && (
                <Button
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => {
                    const phone = whatsAppModalRepair.customerWhatsapp || whatsAppModalRepair.customerPhone || "";
                    const msg = generatePickupMessage(whatsAppModalRepair);
                    const url = getWhatsAppShareUrl(phone, msg);
                    window.open(url, "_blank");
                  }}
                  sx={{
                    backgroundColor: "#25D366",
                    color: "#ffffff",
                    fontWeight: 800,
                    textTransform: "none",
                    px: 2.5,
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(37, 211, 102, 0.35)",
                    "&:hover": {
                      backgroundColor: "#1fad52",
                    },
                  }}
                >
                  Send via WhatsApp
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Container>
        <PersistentCart />
      </Box>
    );
  }


