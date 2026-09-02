"use client";

import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import { CartButton, PersistentCart } from "@/components/cart/persistent-cart";
import InvoiceReceiptView, { Bill } from "@/components/billing/InvoiceReceiptView";
import PosCheckoutTerminal from "@/components/billing/PosCheckoutTerminal";
import PaymentStatusModal from "@/components/billing/PaymentStatusModal";
import { useBills } from "@/hooks/useBills";
import CircularProgress from "@mui/material/CircularProgress";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);

export default function BillingPage() {
  const [activeSection, setActiveSection] = useState<"terminal" | "invoices">("terminal");
  const { bills, loading, addBill, updateBill, deleteBill } = useBills();
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);

  // Filters State for Invoices Tab
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Payment Status Edit Modal
  const [editingBillForStatus, setEditingBillForStatus] = useState<Bill | null>(null);

  const nextInvoiceNumber = `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, "0")}`;

  // Summary Metrics
  const totals = useMemo(() => {
    const paid = bills.filter((b) => b.status === "Paid").length;
    const pending = bills.filter((b) => b.status === "Pending").length;
    const partial = bills.filter((b) => b.status === "Partial").length;
    const totalRevenue = bills.reduce((sum, b) => sum + (b.amountPaid || b.total), 0);
    return { paid, pending, partial, totalRevenue };
  }, [bills]);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills
      .filter((bill) => {
        const searchLower = searchTerm.toLowerCase();
        const searchMatch =
          !searchTerm ||
          bill.id.toLowerCase().includes(searchLower) ||
          bill.customer.toLowerCase().includes(searchLower) ||
          bill.phone.toLowerCase().includes(searchLower) ||
          bill.items.some((item) => item.name.toLowerCase().includes(searchLower));

        const statusMatch = statusFilter === "all" || bill.status === statusFilter;
        const methodMatch = methodFilter === "all" || bill.paymentMethod === methodFilter;

        return searchMatch && statusMatch && methodMatch;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "total-high") return b.total - a.total;
        if (sortBy === "total-low") return a.total - b.total;
        return 0;
      });
  }, [bills, searchTerm, statusFilter, methodFilter, sortBy]);

  const handleSaveBill = async (newBill: Bill, autoPrint = false) => {
    await addBill(newBill);
    setActiveSection("invoices");

    if (autoPrint) {
      setViewingBill(newBill);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.print();
        }, 300);
      }
    }
  };

  const handleUpdateBillSettlement = async (updatedBill: Bill) => {
    const match = bills.find((b) => b.id === updatedBill.id || b.firestoreId === updatedBill.firestoreId);
    if (match?.firestoreId) {
      await updateBill(match.firestoreId, updatedBill);
    }
    if (viewingBill?.id === updatedBill.id) {
      setViewingBill(updatedBill);
    }
  };

  const handleDeleteBill = async (billIdOrFirestoreId: string) => {
    const match = bills.find((b) => b.id === billIdOrFirestoreId || b.firestoreId === billIdOrFirestoreId);
    if (match?.firestoreId) {
      await deleteBill(match.firestoreId);
    }
    if (viewingBill?.id === billIdOrFirestoreId || viewingBill?.firestoreId === billIdOrFirestoreId) {
      setViewingBill(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setSortBy("newest");
  };

  const isFiltersActive =
    searchTerm !== "" || statusFilter !== "all" || methodFilter !== "all" || sortBy !== "newest";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Top Main AppBar */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: "#f5f3ff",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReceiptLongIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#7c3aed", lineHeight: 1.2 }}>
                Billing & POS
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Instant Checkout • Invoicing
              </Typography>
            </Box>
          </Box>

          <CartButton />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3.5 }}>
        {/* Navigation Tabs */}
        <Paper
          sx={{
            mb: 3.5,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeSection}
            onChange={(_, val) => setActiveSection(val)}
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#7c3aed", height: 3.5 },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.92rem",
                color: "#64748b",
                py: 1.8,
              },
              "& .Mui-selected": { color: "#7c3aed" },
            }}
          >
            <Tab
              value="terminal"
              icon={<PointOfSaleIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="POS Checkout Terminal"
            />
            <Tab
              value="invoices"
              icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Invoices & History (${bills.length})`}
            />
          </Tabs>
        </Paper>

        {/* SECTION 1: POS CHECKOUT TERMINAL */}
        {activeSection === "terminal" && (
          <PosCheckoutTerminal
            onSaveBill={handleSaveBill}
            nextInvoiceNumber={nextInvoiceNumber}
          />
        )}

        {/* SECTION 2: FULL WIDTH INVOICES & HISTORY */}
        {activeSection === "invoices" && (
          <Box>
            {/* KPI Cards Row */}
            <Grid container spacing={3} sx={{ mb: 3.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Invoices
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mt: 0.5 }}>
                    {bills.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, textTransform: "uppercase" }}>
                    Paid in Full
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#059669", mt: 0.5 }}>
                    {totals.paid}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#7c3aed", mt: 0.5 }}>
                    {formatCurrency(totals.totalRevenue)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Filter Section with Add New Bill Button in Header */}
            <Paper
              sx={{
                p: 2.5,
                mb: 3.5,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  mb: 2.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterAltIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Filter & Search Invoices
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  {isFiltersActive && (
                    <Button
                      size="small"
                      startIcon={<RestartAltIcon />}
                      onClick={handleResetFilters}
                      sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                    >
                      Reset Filters
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setActiveSection("terminal")}
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2.2,
                      py: 0.8,
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
                      "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                    }}
                  >
                    New POS Bill
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Customer, Contact No or ID"
                    placeholder="e.g., Kasun, 0771234567, INV-2026-001"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Partial">Partial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={methodFilter}
                      label="Payment Method"
                      onChange={(e) => setMethodFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Methods</MenuItem>
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Card">Card</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="newest">Date: Newest First</MenuItem>
                      <MenuItem value="oldest">Date: Oldest First</MenuItem>
                      <MenuItem value="total-high">Amount: High to Low</MenuItem>
                      <MenuItem value="total-low">Amount: Low to High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* FULL-WIDTH SPACIOUS INVOICES TABLE (NO HORIZONTAL SCROLL) */}
            <Paper sx={{ borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden" }}>
              <Box sx={{ p: 2, px: 3, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Invoices Ledger ({filteredBills.length})
                </Typography>
                <Chip label="Live Sync" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                  <CircularProgress sx={{ color: "#7c3aed" }} />
                </Box>
              )}

              {!loading && (
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: "100%", width: "100%" }}>
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "15%", py: 1.75 }}>Invoice Number</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "22%", py: 1.75 }}>Customer Name</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "16%", py: 1.75 }}>Contact Number</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "12%", py: 1.75 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", width: "11%", py: 1.75 }}>Method</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569", width: "14%", py: 1.75 }}>Total Amount</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", width: "10%", py: 1.75 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", width: "10%", py: 1.75 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        hover
                        sx={{
                          transition: "all 0.15s ease",
                          "&:hover": { backgroundColor: "#f8fafc" },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.88rem", py: 1.5 }}>
                          {bill.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem", py: 1.5 }}>
                          {bill.customer}
                        </TableCell>
                        <TableCell sx={{ color: "#475569", fontWeight: 600, fontSize: "0.85rem", py: 1.5 }}>
                          {bill.phone}
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.85rem", py: 1.5 }}>
                          {bill.date}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={bill.paymentMethod}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderColor: "#cbd5e1" }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: "#7c3aed", fontSize: "0.95rem", py: 1.5 }}>
                          {formatCurrency(bill.total)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Chip
                            label={bill.status}
                            size="small"
                            color={
                              bill.status === "Paid"
                                ? "success"
                                : bill.status === "Pending"
                                ? "warning"
                                : bill.status === "Partial"
                                ? "info"
                                : "default"
                            }
                            sx={{ height: 24, fontSize: "0.72rem", fontWeight: 800, px: 0.5 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75 }}>
                            <Tooltip title="View & Print Invoice">
                              <IconButton
                                size="small"
                                onClick={() => setViewingBill(bill)}
                                sx={{
                                  color: "#7c3aed",
                                  backgroundColor: "#f5f3ff",
                                  "&:hover": { backgroundColor: "#ede9fe" },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Update Status">
                              <IconButton
                                size="small"
                                onClick={() => setEditingBillForStatus(bill)}
                                sx={{
                                  color: "#059669",
                                  backgroundColor: "#ecfdf5",
                                  "&:hover": { backgroundColor: "#d1fae5" },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteBill(bill.id)}
                                sx={{
                                  color: "#ef4444",
                                  backgroundColor: "#fef2f2",
                                  "&:hover": { backgroundColor: "#fee2e2" },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              )}

              {!loading && filteredBills.length === 0 && (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
                    No invoices match your search criteria.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Container>

      {/* Invoice Viewer Modal */}
      <Dialog
        open={Boolean(viewingBill)}
        onClose={() => setViewingBill(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "#ffffff",
            py: 1.75,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ReceiptLongIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Invoice Preview: {viewingBill?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setViewingBill(null)} sx={{ color: "white" }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          {viewingBill && (
            <InvoiceReceiptView
              bill={viewingBill}
              onUpdateStatus={(b) => setEditingBillForStatus(b)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Status Modal */}
      <PaymentStatusModal
        open={Boolean(editingBillForStatus)}
        bill={editingBillForStatus}
        onClose={() => setEditingBillForStatus(null)}
        onUpdate={handleUpdateBillSettlement}
      />

      <PersistentCart />
    </Box>
  );
}
