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
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Stack,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Link from "next/link";
import { CartButton, PersistentCart } from "@/components/cart/persistent-cart";

const smartphoneHistory = [
  { id: "SHP-001", customer: "Kasun Perera", model: "iPhone 16 Pro Max", storage: "256GB", qty: 1, amount: 449000, date: "Today, 10:45 AM", status: "Delivered" },
  { id: "SHP-002", customer: "Nimali Fernando", model: "Samsung Galaxy S24 Ultra", storage: "512GB", qty: 1, amount: 388000, date: "Today, 09:15 AM", status: "Delivered" },
  { id: "SHP-003", customer: "Rahul Jayasinghe", model: "Google Pixel 8 Pro", storage: "256GB", qty: 2, amount: 398000, date: "Yesterday", status: "Delivered" },
  { id: "SHP-004", customer: "Chamari Atapattu", model: "iPhone 15 Pro", storage: "128GB", qty: 1, amount: 269000, date: "Yesterday", status: "Delivered" },
  { id: "SHP-005", customer: "Dinesh Chandimal", model: "Pixel 7a", storage: "128GB", qty: 1, amount: 69000, date: "28 Aug 2026", status: "Delivered" },
];

const accessoryHistory = [
  { id: "ACC-001", customer: "Ayesha Silva", item: "Apple 20W USB-C Dock", category: "Charging", qty: 2, amount: 7000, date: "Today, 11:20 AM" },
  { id: "ACC-002", customer: "Tharushi Dias", item: "Aspor 20000mAh Power Bank", category: "Power", qty: 1, amount: 3500, date: "Today, 10:05 AM" },
  { id: "ACC-003", customer: "Bimal Senanayake", item: "SuperD iPhone 16 Tempered Glass", category: "Glass", qty: 3, amount: 2100, date: "Yesterday" },
  { id: "ACC-004", customer: "Kavindu Madushan", item: "Lito 52W Fast Car Charger", category: "Car Charger", qty: 1, amount: 2900, date: "Yesterday" },
  { id: "ACC-005", customer: "Saman Kumara", item: "Silicon Case for Pixel 8", category: "Cover", qty: 2, amount: 1000, date: "28 Aug 2026" },
];

const repairHistory = [
  { id: "REP-2026-001", customer: "Mahela Jayawardene", device: "iPhone 15 Pro", issue: "Screen Replacement (OLED)", technician: "Sanjeewa", amount: 48000, status: "in-progress", date: "Today" },
  { id: "REP-2026-002", customer: "Lasith Malinga", device: "MacBook Pro M2", issue: "Keyboard & Trackpad Repair", technician: "Nuwan", amount: 65000, status: "pending", date: "Today" },
  { id: "REP-2026-003", customer: "Dilshan Tillakaratne", device: "iPhone 13", issue: "Battery Replacement", technician: "Sanjeewa", amount: 18500, status: "completed", date: "Yesterday" },
  { id: "REP-2026-004", customer: "Angelo Mathews", device: "Pixel 8 Pro", issue: "Camera Glass & Sensor Fix", technician: "Pradeep", amount: 32000, status: "in-progress", date: "Yesterday" },
];

const billingHistory = [
  { id: "INV-2026-001", customer: "Kasun Perera", itemsCount: 3, total: 456000, method: "Card", status: "Paid", date: "Today, 10:45 AM" },
  { id: "INV-2026-002", customer: "Nimali Fernando", itemsCount: 2, total: 391500, method: "Cash", status: "Paid", date: "Today, 09:15 AM" },
  { id: "INV-2026-003", customer: "Ayesha Silva", itemsCount: 4, total: 55000, method: "Bank Transfer", status: "Paid", date: "Today, 08:30 AM" },
  { id: "INV-2026-004", customer: "Rahul Jayasinghe", itemsCount: 2, total: 398000, method: "Card", status: "Paid", date: "Yesterday" },
  { id: "INV-2026-005", customer: "Lasith Malinga", itemsCount: 1, total: 65000, method: "Cash", status: "Pending", date: "Yesterday" },
];

const currency = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const totalPhoneSales = smartphoneHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalAccessorySales = accessoryHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalRepairRevenue = repairHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalGrossRevenue = billingHistory.reduce((sum, item) => sum + item.total, 0);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Top App Header */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(30, 64, 175, 0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                backgroundColor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1e40af",
              }}
            >
              <DashboardIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e40af", lineHeight: 1.2 }}>
                iDreams Management Hub
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Point of Sale • Inventory & Service Operations
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/billing" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                startIcon={<PointOfSaleIcon />}
                sx={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  py: 0.75,
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #047857, #059669)" },
                }}
              >
                Open POS Billing
              </Button>
            </Link>
            <CartButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3.5 }}>
        {/* Welcome & Overview Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3.5,
            background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 60%, #0f172a 100%)",
            borderRadius: 3,
            color: "#ffffff",
            boxShadow: "0 10px 25px rgba(30, 64, 175, 0.18)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Chip
              label="Live Store Operations"
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
            <Typography sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.92rem", mt: 0.5 }}>
              Track daily sales, smartphone stock, accessory orders, and repair turnaround in real time.
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
                  color: "#1e40af",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  "&:hover": { backgroundColor: "#f1f5f9" },
                }}
              >
                Smartphones
              </Button>
            </Link>
            <Link href="/accessories" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<HeadphonesIcon />}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                }}
              >
                Accessories
              </Button>
            </Link>
            <Link href="/repairs" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<BuildCircleIcon />}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                }}
              >
                Repairs
              </Button>
            </Link>
          </Box>
        </Paper>

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
                    Total Invoiced Sales
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                    {currency.format(totalGrossRevenue)}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, backgroundColor: "#eff6ff", borderRadius: 2, color: "#1e40af" }}>
                  <AccountBalanceWalletIcon />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: "14px !important", color: "#059669 !important" }} />}
                  label="+18.4% this week"
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
                    Smartphone Volume
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e40af", mt: 0.5 }}>
                    {currency.format(totalPhoneSales)}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, backgroundColor: "#eff6ff", borderRadius: 2, color: "#1e40af" }}>
                  <SmartphoneIcon />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {smartphoneHistory.length} flagship units sold
                </Typography>
                <Link href="/smartphones" style={{ textDecoration: "none" }}>
                  <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                    View &gt;
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
                    Accessories Sales
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#ea580c", mt: 0.5 }}>
                    {currency.format(totalAccessorySales)}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, backgroundColor: "#fff7ed", borderRadius: 2, color: "#ea580c" }}>
                  <HeadphonesIcon />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {accessoryHistory.reduce((acc, i) => acc + i.qty, 0)} items sold today
                </Typography>
                <Link href="/accessories" style={{ textDecoration: "none" }}>
                  <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                    View &gt;
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
                    Repair Services
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
                  {repairHistory.filter((r) => r.status === "in-progress").length} jobs in progress
                </Typography>
                <Link href="/repairs" style={{ textDecoration: "none" }}>
                  <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}>
                    View &gt;
                  </Typography>
                </Link>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Section 2: Store Category Performance Breakdown */}
        <Grid container spacing={3} sx={{ mb: 3.5 }}>
          {/* Revenue Distribution Progress */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Revenue Contribution by Department
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Breakdown of revenue generated across product categories
                  </Typography>
                </Box>
                <Chip label="Current Cycle" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>

              <Stack spacing={2.5}>
                {/* Smartphones */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e40af" }}>
                      Smartphones & Flagships
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                      {currency.format(totalPhoneSales)} (88.4%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={88}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#eff6ff",
                      "& .MuiLinearProgress-bar": { backgroundColor: "#1e40af", borderRadius: 4 },
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
                      {currency.format(totalRepairRevenue)} (9.5%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={10}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#ecfdf5",
                      "& .MuiLinearProgress-bar": { backgroundColor: "#059669", borderRadius: 4 },
                    }}
                  />
                </Box>

                {/* Accessories */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#ea580c" }}>
                      Accessories & Peripherals
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                      {currency.format(totalAccessorySales)} (2.1%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={6}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#fff7ed",
                      "& .MuiLinearProgress-bar": { backgroundColor: "#ea580c", borderRadius: 4 },
                    }}
                  />
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Payment Methods & POS Quick Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2.5, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", height: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                Payment Distribution
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>
                Customer settlement preferences
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CreditCardIcon sx={{ color: "#1e40af" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Credit / Debit Card</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Visa, Mastercard, Amex</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: "#1e40af", fontSize: "0.95rem" }}>62%</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LocalAtmIcon sx={{ color: "#059669" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Cash at Counter</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Direct physical currency</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "0.95rem" }}>28%</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AccountBalanceWalletIcon sx={{ color: "#ea580c" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>Bank Transfer / QR</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>LankaQR, Online Slip</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: "#ea580c", fontSize: "0.95rem" }}>10%</Typography>
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
                Recent Operational Records
              </Typography>
              <Chip label="Auto-Synced" color="success" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                "& .MuiTabs-indicator": { backgroundColor: "#1e40af", height: 3.5 },
                "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.88rem", color: "#64748b" },
                "& .Mui-selected": { color: "#1e40af" },
              }}
            >
              <Tab icon={<SmartphoneIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Smartphone Sales" />
              <Tab icon={<HeadphonesIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Accessories Orders" />
              <Tab icon={<BuildCircleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Active Repairs Queue" />
              <Tab icon={<ReceiptLongIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Invoices & POS History" />
            </Tabs>
          </Box>

          <Box sx={{ p: 2.5 }}>
            {/* Tab 0: Smartphones Sales */}
            {activeTab === 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Txn ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Smartphone Model</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Storage</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Timestamp</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Amount (LKR)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {smartphoneHistory.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: "#1e40af", fontSize: "0.8rem" }}>{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.model}</TableCell>
                        <TableCell>
                          <Chip label={item.storage} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ color: "#475569" }}>{item.customer}</TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.8rem" }}>{item.date}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#1e40af" }}>
                          {currency.format(item.amount)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={item.status} size="small" color="success" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Tab 1: Accessories Orders */}
            {activeTab === 1 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Txn ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Accessory Item</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Customer</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Timestamp</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Total (LKR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accessoryHistory.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: "#ea580c", fontSize: "0.8rem" }}>{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.item}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#fff7ed", color: "#ea580c" }} />
                        </TableCell>
                        <TableCell sx={{ color: "#475569" }}>{item.customer}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>{item.qty}</TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.8rem" }}>{item.date}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#ea580c" }}>
                          {currency.format(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Ticket ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Device</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Service / Issue</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Technician</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Customer</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569" }}>Estimated (LKR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {repairHistory.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: "#059669", fontSize: "0.8rem" }}>{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.device}</TableCell>
                        <TableCell sx={{ color: "#334155" }}>{item.issue}</TableCell>
                        <TableCell sx={{ color: "#64748b" }}>{item.technician}</TableCell>
                        <TableCell sx={{ color: "#475569" }}>{item.customer}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === "completed" ? "success" : item.status === "in-progress" ? "primary" : "warning"}
                            sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#059669" }}>
                          {currency.format(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
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
                    {billingHistory.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: "#1e40af", fontSize: "0.8rem" }}>{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>{item.customer}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{item.itemsCount}</TableCell>
                        <TableCell sx={{ color: "#64748b" }}>{item.method}</TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.8rem" }}>{item.date}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === "Paid" ? "success" : "warning"}
                            sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {currency.format(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Container>

      <PersistentCart />
    </Box>
  );
}
