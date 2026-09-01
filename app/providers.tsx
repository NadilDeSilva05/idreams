"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e40af", // Dark blue
      light: "#3b82f6",
      dark: "#1e3a8a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ea580c", // Vibrant orange
      light: "#f97316",
      dark: "#c2410c",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(30, 64, 175, 0.08)",
          color: "#1e293b",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 20px",
          transition: "all 0.3s ease",
        },
        contained: {
          boxShadow: "0 4px 12px rgba(30, 64, 175, 0.25)",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(30, 64, 175, 0.35)",
            transform: "translateY(-2px)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
        },
        outlined: {
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover fieldset": {
              borderColor: "#1e40af",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#e2e8f0",
        },
        head: {
          backgroundColor: "#f1f5f9",
          fontWeight: 700,
          color: "#1e293b",
        },
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
