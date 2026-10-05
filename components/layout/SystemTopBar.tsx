"use client";

import { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Chip,
  Avatar,
  Snackbar,
  Button,
} from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSale";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { CartButton } from "@/components/cart/persistent-cart";
import { useRepairs } from "@/hooks/useRepairs";

const TITLE_BY_PATH: Record<string, { label: string; description?: string; accent: string }> = {
  "/": { label: "Dashboard", description: "Today at a glance", accent: "#7c3aed" },
  "/smartphones": { label: "Smartphones Inventory", description: "Phones, variants, and stock", accent: "#2563eb" },
  "/accessories": { label: "Accessories Inventory", description: "Cases, cables, chargers & more", accent: "#ea580c" },
  "/repairs": { label: "Repair Tickets", description: "Jobs in progress and history", accent: "#0891b2" },
  "/billing": { label: "Billing & POS", description: "Checkout and invoicing", accent: "#059669" },
  "/selling-history": { label: "Selling History", description: "Past sales and revenue", accent: "#7c3aed" },
  "/history": { label: "System Audit History", description: "Every operation in the shop", accent: "#9333ea" },
};

const PATH_ICON: Record<string, React.ComponentType<{ sx?: object }>> = {
  "/": DashboardRoundedIcon,
  "/smartphones": PhoneIphoneRoundedIcon,
  "/accessories": HeadphonesRoundedIcon,
  "/repairs": HomeRepairServiceRoundedIcon,
  "/billing": ReceiptLongRoundedIcon,
  "/selling-history": HistoryRoundedIcon,
  "/history": AccountTreeRoundedIcon,
};

type RoleChipMode = "viewCartWithIcon" | "viewCart" | "shopkeeper" | null;

interface PageTopBarConfig {
  showCartButton: boolean;
  roleChipMode: RoleChipMode;
  showRepairTicketCount?: boolean;
  showPOSShortcut?: boolean;
}

const PAGE_TOPBAR_CONFIG: Record<string, PageTopBarConfig> = {
  "/": {
    showCartButton: true,
    roleChipMode: null,
    showPOSShortcut: true,
  },
  "/smartphones": {
    showCartButton: true,
    roleChipMode: "viewCart",
  },
  "/accessories": {
    showCartButton: true,
    roleChipMode: "viewCartWithIcon",
  },
  "/repairs": {
    showCartButton: true,
    roleChipMode: null,
    showRepairTicketCount: true,
  },
  "/billing": {
    showCartButton: true,
    roleChipMode: "shopkeeper",
  },
  "/selling-history": {
    showCartButton: false,
    roleChipMode: null,
  },
  "/history": {
    showCartButton: false,
    roleChipMode: null,
  },
};

export interface SystemTopBarProps {
  onDrawerToggle?: () => void;
  showDrawerToggle?: boolean;
}

export function SystemTopBar({
  onDrawerToggle,
  showDrawerToggle = true,
}: SystemTopBarProps) {
  const pathname = usePathname();
  const { user, isOwner } = useAuth();
  const [copied, setCopied] = useState(false);
  const { repairs } = useRepairs();

  const meta = useMemo(() => {
    const hit = TITLE_BY_PATH[pathname];
    if (hit) return hit;
    const fallback = Object.entries(TITLE_BY_PATH).find(([p]) => pathname.startsWith(p + "/"));
    if (fallback) return fallback[1];
    return {
      label: "iDreams POS",
      description: "Shop management system",
      accent: "#7c3aed",
    };
  }, [pathname]);

  const TitleIcon = PATH_ICON[pathname] || StorefrontRoundedIcon;

  const pageConfig = useMemo<PageTopBarConfig>(() => {
    const hit = PAGE_TOPBAR_CONFIG[pathname];
    if (hit) return hit;
    const fallback = Object.entries(PAGE_TOPBAR_CONFIG).find(([p]) =>
      pathname.startsWith(p + "/")
    );
    if (fallback) return fallback[1];
    return {
      showCartButton: false,
      roleChipMode: null,
    };
  }, [pathname]);

  const roleChip = useMemo(() => {
    if (isOwner || !pageConfig.roleChipMode) return null;
    const mode = pageConfig.roleChipMode;
    const baseSx = {
      backgroundColor: "#fff7ed",
      color: "#ea580c",
      fontWeight: 700,
      fontSize: "0.7rem",
      border: "1px solid #fed7aa",
    };
    if (mode === "shopkeeper") {
      return (
        <Chip label="Shopkeeper" size="small" sx={baseSx} />
      );
    }
    if (mode === "viewCartWithIcon") {
      return (
        <Chip
          icon={<BlockRoundedIcon sx={{ fontSize: "14px !important" }} />}
          label="View & Cart Only"
          size="small"
          sx={baseSx}
        />
      );
    }
    return (
      <Chip label="View & Cart Only" size="small" sx={baseSx} />
    );
  }, [isOwner, pageConfig.roleChipMode]);

  const handleCopyStoreCode = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SK";

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          color: "#0f172a",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            minHeight: { xs: 56, md: 60 },
            px: { xs: 1.25, sm: 2, md: 3 },
            gap: 1.5,
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
          }}
        >
          {/* LEFT — Drawer toggle + Brand + Route Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              minWidth: 0,
              flex: 1,
            }}
          >
            {showDrawerToggle && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={onDrawerToggle}
                sx={{
                  color: "#7c3aed",
                  display: { md: "none" },
                  p: 0.75,
                }}
              >
                <MenuRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            )}

            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                gap: 1,
                mr: 1,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1.5,
                  background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 2px 6px rgba(124,58,237,0.25)",
                }}
              >
                <StorefrontRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}
              >
                iDreams
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0, display: { xs: "none", md: "block" } }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  pr: 1.5,
                  py: 0.25,
                  mb: 0.25,
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1.25,
                    backgroundColor: meta.accent + "18",
                    color: meta.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TitleIcon sx={{ fontSize: 14 }} />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    color: "#0f172a",
                    fontSize: "0.98rem",
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {meta.label}
                </Typography>
                {roleChip}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  pl: "36px",
                  display: "block",
                }}
              >
                {meta.description}
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
                display: { xs: "block", md: "none" },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: "0.88rem",
                  lineHeight: 1.1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {meta.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {meta.description}
              </Typography>
            </Box>
          </Box>

          {/* RIGHT — Page Extras + Cart + Store Code + User + Shop Role */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexShrink: 0,
            }}
          >
            {pageConfig.showPOSShortcut && (
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Link href="/billing" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    startIcon={<PointOfSaleRoundedIcon />}
                    size="small"
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 1.75,
                      py: 0.7,
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                      "&:hover": { background: "linear-gradient(135deg, #6d28d9 0%, #c2410c 100%)" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Open POS Billing
                  </Button>
                </Link>
              </Box>
            )}

            {pageConfig.showRepairTicketCount && (
              <Chip
                label={`${repairs.length} Total Tickets`}
                size="small"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  backgroundColor: "#f5f3ff",
                  color: "#7c3aed",
                  fontWeight: 700,
                  border: "1px solid #ddd6fe",
                }}
              />
            )}

            <Box id="topbar-export-slot" sx={{ display: "inline-flex", alignItems: "center" }} />

            {pageConfig.showCartButton && <CartButton />}

            {isOwner && user?.uid && (
              <Tooltip
                title={
                  copied
                    ? "Store Code copied!"
                    : "Click to copy Store Code (share this with shopkeepers)"
                }
              >
                <Box
                  onClick={handleCopyStoreCode}
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    alignItems: "center",
                    gap: 0.75,
                    cursor: "pointer",
                    userSelect: "none",
                    px: 1.25,
                    py: 0.6,
                    borderRadius: 1.75,
                    backgroundColor: copied ? "#dcfce7" : "#f5f3ff",
                    border: `1px solid ${copied ? "#86efac" : "#ddd6fe"}`,
                    transition: "all 0.18s ease",
                    "&:hover": {
                      backgroundColor: copied ? "#bbf7d0" : "#ede9fe",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 6px rgba(124,58,237,0.15)",
                    },
                    maxWidth: 260,
                  }}
                >
                  <StoreRoundedIcon
                    sx={{
                      fontSize: 15,
                      color: copied ? "#16a34a" : "#7c3aed",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: copied ? "#166534" : "#6d28d9",
                        fontSize: "0.6rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        lineHeight: 1,
                      }}
                    >
                      Store Code
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontFamily: "monospace",
                        color: copied ? "#15803d" : "#4c1d95",
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                        mt: 0.15,
                      }}
                    >
                      {user.uid}
                    </Typography>
                  </Box>
                  {copied ? (
                    <CheckRoundedIcon sx={{ fontSize: 15, color: "#16a34a" }} />
                  ) : (
                    <ContentCopyRoundedIcon
                      sx={{ fontSize: 15, color: "#7c3aed", flexShrink: 0 }}
                    />
                  )}
                </Box>
              </Tooltip>
            )}

            {isOwner && user?.uid && (
              <Tooltip
                title={copied ? "Copied!" : "Copy Store Code"}
                sx={{ display: { sm: "none" } }}
              >
                <IconButton
                  size="small"
                  onClick={handleCopyStoreCode}
                  sx={{
                    display: { xs: "inline-flex", sm: "none" },
                    color: copied ? "#16a34a" : "#7c3aed",
                    backgroundColor: copied ? "#dcfce7" : "#f5f3ff",
                    p: 0.8,
                    "&:hover": {
                      backgroundColor: copied ? "#bbf7d0" : "#ede9fe",
                    },
                  }}
                >
                  {copied ? (
                    <CheckRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <StoreRoundedIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {/* <Chip
              size="small"
              label={
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.65rem", fontWeight: 900, lineHeight: 1 }}
                >
                  {user?.shopName || "Main Branch"}
                </Typography>
              }
              icon={<StorefrontRoundedIcon sx={{ fontSize: 13 }} />}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                height: 24,
                pl: 0.25,
                pr: 0.75,
                backgroundColor: "#f8fafc",
                color: "#334155",
                border: "1px solid #e2e8f0",
                "& .MuiChip-icon": { color: "#7c3aed" },
              }}
            /> */}

            {/* <Tooltip title={`Signed in as ${user?.name || "user"}`} placement="bottom-end">
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.85,
                  pl: 0.35,
                  pr: 1.25,
                  py: 0.35,
                  borderRadius: 999,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
                    color: "#ffffff",
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      fontSize: "0.74rem",
                      display: "block",
                      lineHeight: 1.1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 110,
                    }}
                  >
                    {user?.name || "Shopkeeper"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      display: "block",
                      lineHeight: 1.1,
                    }}
                  >
                    {user?.role === "ShopOwner" ? "Shop Owner" : "Shopkeeper"}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "inline-flex", sm: "none" } }}>
                  <AccountCircleRoundedIcon sx={{ fontSize: 16, color: "#7c3aed" }} />
                </Box>
              </Box>
            </Tooltip> */}
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        message="Store Code copied to clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
