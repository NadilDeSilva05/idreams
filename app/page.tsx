"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Stack,
  CircularProgress,
} from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import Link from "next/link";
import { PersistentCart } from "@/components/cart/persistent-cart";
import { useSmartphones } from "@/hooks/useSmartphones";
import { useAccessories, categoryLabels } from "@/hooks/useAccessories";
import { useRepairs } from "@/hooks/useRepairs";
import { useBills } from "@/hooks/useBills";

const currency = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const { smartphones, loading: phonesLoading } = useSmartphones();
  const { accessories, loading: accLoading } = useAccessories();
  const { repairs, loading: repLoading } = useRepairs();
  const { bills, loading: billsLoading } = useBills();

  const isGlobalLoading = phonesLoading || accLoading || repLoading || billsLoading;

  // Live Calculations from Firestore data
  const totalGrossRevenue = bills.reduce((sum, b) => sum + (b.amountPaid || b.total || 0), 0);
  const totalRepairRevenue = repairs.reduce((sum, r) => sum + (r.price || 0), 0);
  const totalInvoicedCount = bills.length;
  const activeRepairsCount = repairs.filter((r) => r.status === "in-progress" || r.status === "pending").length;

  // Department revenue approximations
  const totalCalculated = totalGrossRevenue + totalRepairRevenue || 1;
  const billsRevenuePercent = Math.min(100, Math.round((totalGrossRevenue / totalCalculated) * 100));
  const repairRevenuePercent = Math.min(100, Math.round((totalRepairRevenue / totalCalculated) * 100));

  // Payment method breakdowns from real bills
  const cashBills = bills.filter((b) => b.paymentMethod === "Cash").length;
  const cardBills = bills.filter((b) => b.paymentMethod === "Card").length;
  const bankBills = bills.filter((b) => b.paymentMethod === "Bank Transfer" || b.paymentMethod === "Split" || b.paymentMethod === "Installment").length;
  const totalMethodBills = bills.length || 1;
  const cardPercent = Math.round((cardBills / totalMethodBills) * 100);
  const cashPercent = Math.round((cashBills / totalMethodBills) * 100);
  const bankPercent = Math.round((bankBills / totalMethodBills) * 100);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Container maxWidth="xl" sx={{ py: 2.5 }}>
        {/* Welcome & Overview Header */}
        <Paper
          sx={{
            p: 2.25,
            mb: 2.5,
            background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #ea580c 100%)",
            borderRadius: 3,
            color: "#ffffff",
            boxShadow: "0 10px 25px rgba(124, 58, 237, 0.18)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Chip
              label="Cloud Synced Database"
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.72rem",
                mb: 1,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Business Performance & Inventory
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "0.92rem", mt: 0.5 }}>
              Live real-time operational dashboard connected to your Firestore store database.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Link href="/smartphones" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<SmartphoneIcon />}
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#7c3aed",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  "&:hover": { backgroundColor: "#f5f3ff" },
                }}
              >
                Smartphones ({smartphones.length})
              </Button>
            </Link>
            <Link href="/accessories" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<HeadphonesIcon />}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.28)" },
                }}
              >
                Accessories ({accessories.length})
              </Button>
            </Link>
            <Link href="/repairs" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<BuildCircleIcon />}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.28)" },
                }}
              >
                Repairs ({repairs.length})
              </Button>
            </Link>
          </Box>
        </Paper>

        {isGlobalLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#7c3aed" }} />
          </Box>
        ) : (
          <>
            {/* Top Metric Cards */}
            <Grid container spacing={3} sx={{ mb: 3.5 }}>
              {/* Card 1: Total Revenue */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        Total Invoiced Revenue
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                        {currency.format(totalGrossRevenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, backgroundColor: "#f5f3ff", borderRadius: 2, color: "#7c3aed" }}>
                      <AccountBalanceWalletIcon />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      icon={<TrendingUpIcon sx={{ fontSize: "14px !important", color: "#059669 !important" }} />}
                      label={`${totalInvoicedCount} Invoices Total`}
                      size="small"
                      sx={{ backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Card 2: Smartphones */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        Smartphones Inventory
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#7c3aed", mt: 0.5 }}>
                        {smartphones.length} Models
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, backgroundColor: "#f5f3ff", borderRadius: 2, color: "#7c3aed" }}>
                      <SmartphoneIcon />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                      {smartphones.reduce((acc, s) => acc + (s.variants?.length || 0), 0)} storage variants
                    </Typography>
                    <Link href="/smartphones" style={{ textDecoration: "none" }}>
                      <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                        Manage &gt;
                      </Typography>
                    </Link>
                  </Box>
                </Paper>
              </Grid>

              {/* Card 3: Accessories */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        Accessories Stock
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#ea580c", mt: 0.5 }}>
                        {accessories.length} Items
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, backgroundColor: "#fff7ed", borderRadius: 2, color: "#ea580c" }}>
                      <HeadphonesIcon />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                      {accessories.filter((a) => a.inStock).length} in stock
                    </Typography>
                    <Link href="/accessories" style={{ textDecoration: "none" }}>
                      <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                        Catalog &gt;
                      </Typography>
                    </Link>
                  </Box>
                </Paper>
              </Grid>

              {/* Card 4: Repair Services */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        Repair Value
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#059669", mt: 0.5 }}>
                        {currency.format(totalRepairRevenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, backgroundColor: "#ecfdf5", borderRadius: 2, color: "#059669" }}>
                      <BuildCircleIcon />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700 }}>
                      {activeRepairsCount} active queue jobs
                    </Typography>
                    <Link href="/repairs" style={{ textDecoration: "none" }}>
                      <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                        Queue &gt;
                      </Typography>
                    </Link>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Section 2: Store Category Performance Breakdown */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {/* Revenue Distribution Progress */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 2.25, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        Revenue Contribution Breakdown
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Live comparison of POS sales vs Repair service pipeline
                      </Typography>
                    </Box>
                    <Chip label="Live Sync" size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Stack spacing={2.5}>
                    {/* Invoiced Sales */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#7c3aed" }}>
                          Invoiced Sales & Orders
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                          {currency.format(totalGrossRevenue)} ({billsRevenuePercent}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={billsRevenuePercent}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#f5f3ff",
                          "& .MuiLinearProgress-bar": { backgroundColor: "#7c3aed", borderRadius: 4 },
                        }}
                      />
                    </Box>

                    {/* Repairs */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#059669" }}>
                          Hardware & Diagnostic Repairs
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                          {currency.format(totalRepairRevenue)} ({repairRevenuePercent}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={repairRevenuePercent}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#ecfdf5",
                          "& .MuiLinearProgress-bar": { backgroundColor: "#059669", borderRadius: 4 },
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Payment Methods & POS Quick Summary */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2.25, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", height: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                    Settlement Methods
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1.5 }}>
                    Customer payment preferences from live invoices
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <CreditCardIcon sx={{ color: "#7c3aed" }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Credit / Debit Card</Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>{cardBills} invoices</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.95rem" }}>{cardPercent}%</Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <LocalAtmIcon sx={{ color: "#059669" }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Cash at Counter</Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>{cashBills} invoices</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "0.95rem" }}>{cashPercent}%</Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <AccountBalanceWalletIcon sx={{ color: "#ea580c" }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Bank Transfer / Other</Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>{bankBills} invoices</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: "#ea580c", fontSize: "0.95rem" }}>{bankPercent}%</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Section 3: Operational Activity Hub with Tabbed Tables */}
            <Paper sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden" }}>
              <Box sx={{ borderBottom: "1px solid #e2e8f0", px: 3, pt: 2, backgroundColor: "#ffffff" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Live Inventory & Activity Records
                  </Typography>
                  <Chip label="Firestore Live" color="success" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>

                <Tabs
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
                  sx={{
                    "& .MuiTabs-indicator": { backgroundColor: "#7c3aed", height: 3.5 },
                    "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.88rem", color: "#64748b" },
                    "& .Mui-selected": { color: "#7c3aed" },
                  }}
                >
                  <Tab icon={<SmartphoneIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Smartphones (${smartphones.length})`} />
                  <Tab icon={<HeadphonesIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Accessories (${accessories.length})`} />
                  <Tab icon={<BuildCircleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Repairs Queue (${repairs.length})`} />
                  <Tab icon={<ReceiptLongIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Invoices (${bills.length})`} />
                </Tabs>
              </Box>

              <Box sx={{ p: 2.5 }}>
                {/* Tab 0: Smartphones Live Catalog */}
                {activeTab === 0 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Brand</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Smartphone Model</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Storage Variants</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Starting Price (LKR)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {smartphones.map((item, idx) => {
                          const minPrice = item.variants?.length ? Math.min(...item.variants.map((v) => v.price)) : 0;
                          return (
                            <TableRow key={item.id || idx} hover>
                              <TableCell sx={{ fontWeight: 800, color: "#7c3aed" }}>{item.brand}</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.model}</TableCell>
                              <TableCell>
                                <Chip
                                  label={item.category}
                                  size="small"
                                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize" }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: "#475569" }}>
                                {item.variants?.map((v) => v.storage).join(", ") || "Standard"}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800, color: "#7c3aed" }}>
                                {currency.format(minPrice)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {smartphones.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#64748b" }}>
                              No smartphones added yet. Go to the Smartphones tab to add your first product.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Tab 1: Accessories Live Catalog */}
                {activeTab === 1 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Brand</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Accessory Item</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Specifications</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Stock Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Price (LKR)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accessories.map((item, idx) => (
                          <TableRow key={item.id || idx} hover>
                            <TableCell sx={{ fontWeight: 700, color: "#ea580c" }}>{item.brand}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={categoryLabels[item.category] || item.category}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#fff7ed", color: "#ea580c" }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: "#475569" }}>{item.specifications || "Standard"}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.inStock ? "In Stock" : "Out of Stock"}
                                size="small"
                                color={item.inStock ? "success" : "error"}
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: "#ea580c" }}>
                              {currency.format(item.price)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {accessories.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#64748b" }}>
                              No accessories added yet. Go to Accessories tab to add stock.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Tab 2: Repairs Queue */}
                {activeTab === 2 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Device Type</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Device / Model</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Repair Service</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Price (LKR)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {repairs.map((item, idx) => (
                          <TableRow key={item.id || idx} hover>
                            <TableCell sx={{ fontWeight: 700, color: "#059669", textTransform: "capitalize" }}>
                              {item.deviceType}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>
                              {item.brand ? `${item.brand} ` : ""}{item.model}
                            </TableCell>
                            <TableCell sx={{ color: "#334155" }}>{item.repairType}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.status}
                                size="small"
                                color={item.status === "completed" ? "success" : item.status === "in-progress" ? "primary" : "warning"}
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize" }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: "#059669" }}>
                              {currency.format(item.price)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {repairs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#64748b" }}>
                              No repair tickets logged yet. Go to Repairs tab to register a job.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Tab 3: Billing & Invoices */}
                {activeTab === 3 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Invoice ID</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Customer</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Items</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Method</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Date</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Total (LKR)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bills.map((item, idx) => (
                          <TableRow key={item.id || item.firestoreId || idx} hover>
                            <TableCell sx={{ fontWeight: 700, color: "#7c3aed", fontSize: "0.8rem" }}>{item.id}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.customer}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>{item.itemCount || item.items?.length || 0}</TableCell>
                            <TableCell sx={{ color: "#64748b" }}>{item.paymentMethod}</TableCell>
                            <TableCell sx={{ color: "#64748b", fontSize: "0.8rem" }}>{item.date}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.status}
                                size="small"
                                color={item.status === "Paid" ? "success" : item.status === "Pending" ? "warning" : "info"}
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: "#0f172a" }}>
                              {currency.format(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {bills.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#64748b" }}>
                              No invoices generated yet. Create a bill from the POS Billing terminal.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Container>

      <PersistentCart />
    </Box>
  );
}
