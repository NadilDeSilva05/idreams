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
  AppBar,
  Toolbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
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
import { Repair } from "@/types/repair";
import AddRepairModal from "@/components/repairs/AddRepairModal";
import { useCart } from "@/context/cart-context";
import { PersistentCart, CartButton } from "@/components/cart/persistent-cart";
import { useRepairs } from "@/hooks/useRepairs";
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
  const { repairs, loading, addRepair, updateRepair, deleteRepair } = useRepairs();
  const [openModal, setOpenModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);

  // Add to cart modal state
  const [selectedRepairForCart, setSelectedRepairForCart] = useState<Repair | null>(null);
  const [repairCartPrice, setRepairCartPrice] = useState("");

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
      setEditingRepair(null);
    } else {
      await addRepair({
        ...repairData,
        dateCreated: new Date(),
      });
    }
    setOpenModal(false);
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
        repair.repairType.toLowerCase().includes(searchTerm.toLowerCase());

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
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ height: 32, display: "flex", alignItems: "center" }}>
              <img
                src="/Images/i Dreams.png"
                alt="iDreams Logo"
                style={{ height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ height: 18, my: "auto" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 0.75 }}>
              <BuildCircleIcon sx={{ color: "#7c3aed", fontSize: 22 }} />
              Repairs Management
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Chip
              label={`${repairs.length} Total Tickets`}
              size="small"
              sx={{
                backgroundColor: "#f5f3ff",
                color: "#7c3aed",
                fontWeight: 700,
                border: "1px solid #ddd6fe",
              }}
            />
            <CartButton />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Filter & Action Section */}
          <Paper
            sx={{
              p: 3,
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

            <Divider sx={{ mb: 2.5 }} />

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
            <TableContainer
              component={Paper}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 2.5,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>Repair ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>Model & Specs</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>Repair Service</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }} align="right">
                      Price (LKR)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.88rem" }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRepairs.map((repair) => (
                    <TableRow
                      key={repair.id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: "#7c3aed", fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {repair.id}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
                          {repair.brand && `${repair.brand} `}
                          {repair.model}
                        </Typography>
                        {repair.storage && (
                          <Chip
                            label={repair.storage}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: "0.68rem", mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#334155" }}>{repair.repairType}</TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "0.92rem" }}>
                          Rs. {repair.price.toLocaleString("en-LK")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                          size="small"
                          color={getStatusChipColor(repair.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#64748b", fontSize: "0.82rem" }}>
                        {formatDate(repair.dateCreated)}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddShoppingCartIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleOpenCartDialog(repair)}
                            sx={{
                              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "0.75rem",
                              py: 0.35,
                              px: 1.25,
                              borderRadius: 1.5,
                              boxShadow: "0 2px 6px rgba(124, 58, 237, 0.2)",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                background: "linear-gradient(135deg, #6d28d9, #c2410c)",
                              },
                            }}
                          >
                            Add to Cart
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleEditRepair(repair)}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.75rem",
                              py: 0.25,
                              px: 1,
                              borderRadius: 1.5,
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleDeleteRepair(repair.id)}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.75rem",
                              py: 0.25,
                              px: 1,
                              borderRadius: 1.5,
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
                  px: 3,
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
        </Container>
        <PersistentCart />
      </Box>
    );
  }


