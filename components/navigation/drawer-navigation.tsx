"use client";

import { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  Tooltip,
  Snackbar,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "@/context/auth-context";
import { SystemTopBar } from "@/components/layout/SystemTopBar";


const drawerWidth = 270;

interface NavItem {
  label: string;
  icon: React.ComponentType<{ sx?: object }>;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: DashboardRoundedIcon, href: "/" },
    ],
  },
  {
    title: "STORE & INVENTORY",
    items: [
      { label: "Smartphones", icon: PhoneIphoneRoundedIcon, href: "/smartphones" },
      { label: "Accessories", icon: HeadphonesRoundedIcon, href: "/accessories" },
    ],
  },
  {
    title: "SERVICES & SALES",
    items: [
      { label: "Repairs", icon: HomeRepairServiceRoundedIcon, href: "/repairs" },
      { label: "Billing & POS", icon: ReceiptLongRoundedIcon, href: "/billing" },
      { label: "Selling History", icon: HistoryRoundedIcon, href: "/selling-history" },
      { label: "System Audit History", icon: AccountTreeRoundedIcon, href: "/history" },
    ],
  },
];

export function NavigationDrawer({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, isOwner } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Hide drawer on authentication pages
  if (pathname === "/signin" || pathname === "/signup") {
    return <>{children}</>;
  }

  const isRelevantPage =
    pathname === "/" ||
    pathname === "/repairs" ||
    pathname === "/smartphones" ||
    pathname === "/accessories" ||
    pathname === "/billing" ||
    pathname === "/selling-history" ||
    pathname === "/history";

  if (!isRelevantPage) {
    return <>{children}</>;
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SK";

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        color: "#0f172a",
      }}
    >
      {/* Header Branding */}
      <Box
        sx={{
          p: 2.5,
          pb: 2,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <img
            src="/Images/i Dreams.png"
            alt="iDreams Logo"
            style={{
              height: 38,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Role Status indicator */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.4,
            borderRadius: 5,
            backgroundColor: user?.role === "ShopOwner" ? "#f5f3ff" : "#fff7ed",
            border: `1px solid ${user?.role === "ShopOwner" ? "#ddd6fe" : "#fed7aa"}`,
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: user?.role === "ShopOwner" ? "#7c3aed" : "#ea580c",
              boxShadow: user?.role === "ShopOwner" ? "0 0 0 2px rgba(124, 58, 237, 0.2)" : "0 0 0 2px rgba(234, 88, 12, 0.2)",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: "0.68rem",
              color: user?.role === "ShopOwner" ? "#7c3aed" : "#ea580c",
              letterSpacing: "0.02em",
            }}
          >
            Role: {user?.role === "ShopOwner" ? "Shop Owner" : "Shopkeeper"}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#e2e8f0",
            borderRadius: 2,
          },
        }}
      >
        {navSections.map((section, idx) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                mb: 0.75,
                display: "block",
                fontWeight: 800,
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </Typography>
            <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      px: 1.5,
                      transition: "all 0.18s ease-in-out",
                      backgroundColor: isActive ? "#f5f3ff" : "transparent",
                      color: isActive ? "#7c3aed" : "#475569",
                      fontWeight: isActive ? 800 : 600,
                      "&:hover": {
                        backgroundColor: isActive ? "#f5f3ff" : "#f8fafc",
                        color: "#7c3aed",
                        transform: "translateX(2px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? "#7c3aed" : "#64748b",
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: isActive ? 800 : 600,
                            color: isActive ? "#7c3aed" : "inherit",
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          backgroundColor: isActive ? "#7c3aed" : "#f1f5f9",
                          color: isActive ? "#ffffff" : "#64748b",
                        }}
                      />
                    )}
                    {isActive && (
                      <ChevronRightRoundedIcon sx={{ fontSize: 16, color: "#7c3aed", ml: 0.5 }} />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
            {idx < navSections.length - 1 && <Divider sx={{ my: 1.5, borderColor: "#f1f5f9" }} />}
          </Box>
        ))}
      </Box>

      {/* Footer Profile & Logout */}
      <Box
        sx={{
          p: 1.75,
          borderTop: "1px solid #f1f5f9",
          backgroundColor: "#fafbfd",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.25,
            borderRadius: 2,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            gap: 1.25,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: "0.8rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
              color: "#ffffff",
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: "0.82rem",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Shopkeeper"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.7rem",
                display: "block",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.shopName || "Main Branch"}
            </Typography>
          </Box>
          <Tooltip title="Sign Out">
            <IconButton
              size="small"
              onClick={signOut}
              sx={{
                color: "#94a3b8",
                "&:hover": { color: "#ef4444", backgroundColor: "#fef2f2" },
                p: 0.6,
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );


  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e2e8f0",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Fixed Drawer - Stays Fixed on Scroll */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              borderRight: "1px solid #e2e8f0",
              boxShadow: "1px 0 10px rgba(0, 0, 0, 0.03)",
              zIndex: 1200,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SystemTopBar onDrawerToggle={handleDrawerToggle} />

        {/* Page Content */}
        <Box sx={{ flex: 1, width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
}

