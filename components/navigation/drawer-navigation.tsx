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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    ],
  },
];

export function NavigationDrawer({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isRelevantPage =
    pathname === "/" ||
    pathname === "/repairs" ||
    pathname === "/smartphones" ||
    pathname === "/accessories" ||
    pathname === "/billing";

  if (!isRelevantPage) {
    return <>{children}</>;
  }

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1,
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(30, 64, 175, 0.25)",
              color: "#ffffff",
            }}
          >
            <StorefrontRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: "-0.02em",
                color: "#0f172a",
                lineHeight: 1.15,
              }}
            >
              iDreams
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: "0.68rem",
                color: "#1e40af",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Retail & POS Suite
            </Typography>
          </Box>
        </Box>

        {/* Live Status indicator */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.4,
            borderRadius: 10,
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            mt: 0.5,
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#065f46",
              letterSpacing: "0.02em",
            }}
          >
            Store Terminal Online
          </Typography>
        </Box>
      </Box>

      {/* Navigation Sections */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 2,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#e2e8f0",
            borderRadius: "2px",
          },
        }}
      >
        {navSections.map((section, sIdx) => (
          <Box key={section.title} sx={{ mb: sIdx !== navSections.length - 1 ? 2.5 : 1 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                mb: 0.75,
                display: "block",
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#94a3b8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <ListItemButton
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        px: 1.5,
                        py: 1.1,
                        position: "relative",
                        backgroundColor: isActive ? "rgba(30, 64, 175, 0.08)" : "transparent",
                        border: isActive ? "1px solid rgba(30, 64, 175, 0.18)" : "1px solid transparent",
                        transition: "all 0.15s ease-in-out",
                        "&:hover": {
                          backgroundColor: isActive ? "rgba(30, 64, 175, 0.12)" : "#f8fafc",
                          transform: "translateX(2px)",
                        },
                      }}
                    >
                      {/* Active indicator bar
                      {isActive && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: "20%",
                            bottom: "20%",
                            width: 3.5,
                            borderRadius: "50px 0 0 50px",
                            backgroundColor: "#1e40af",
                          }}
                        />
                      )} */}

                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? "#1e40af" : "#64748b",
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </ListItemIcon>

                      <ListItemText
                        primary={item.label}
                        sx={{
                          my: 0,
                          "& .MuiListItemText-primary": {
                            fontWeight: isActive ? 750 : 600,
                            color: isActive ? "#1e40af" : "#334155",
                            fontSize: "0.9rem",
                            letterSpacing: "-0.01em",
                          },
                        }}
                      />

                      {isActive && (
                        <ChevronRightRoundedIcon
                          sx={{
                            fontSize: 16,
                            color: "#1e40af",
                            opacity: 0.8,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Link>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "#f1f5f9" }} />

      {/* Footer Profile / Branch Box */}
      <Box sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: "0.85rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #1e40af 0%, #4338ca 100%)",
              color: "#ffffff",
            }}
          >
            ID
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.82rem",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Main Store POS
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.72rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Colombo Branch
            </Typography>
          </Box>
          <Chip
            label="v1.2"
            size="small"
            sx={{
              height: 18,
              fontSize: "0.65rem",
              fontWeight: 700,
              backgroundColor: "#f1f5f9",
              color: "#475569",
            }}
          />
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
        {/* Mobile Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: "flex", md: "none" },
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            color: "#0f172a",
          }}
        >
          <Toolbar sx={{ minHeight: 56 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1.5, color: "#1e40af" }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <StorefrontRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                iDreams POS
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
}

