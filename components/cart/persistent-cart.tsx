"use client";

import {
  Box,
  Drawer,
  Paper,
  Typography,
  Divider,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  Badge,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCart } from "@/context/cart-context";
import Link from "next/link";

export function CartButton() {
  const { toggleCart, totalQuantity } = useCart();

  return (
    <Tooltip title="View Shopping Cart">
      <IconButton
        onClick={toggleCart}
        sx={{
          backgroundColor: "#eff6ff",
          color: "#1e40af",
          border: "1px solid #bfdbfe",
          p: 1,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#dbeafe",
            borderColor: "#93c5fd",
            transform: "scale(1.04)",
          },
        }}
      >
        <Badge
          badgeContent={totalQuantity}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 800,
              fontSize: "0.72rem",
              backgroundColor: "#ef4444",
            },
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 22 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

export function PersistentCart() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    totalQuantity,
  } = useCart();

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 340 },
            maxWidth: "100vw",
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-6px 0 24px rgba(15, 23, 42, 0.12)",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1e40af",
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a", lineHeight: 1.2 }}>
              Shopping Cart
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.7rem" }}>
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={closeCart}
          size="small"
          sx={{
            color: "#64748b",
            backgroundColor: "#f1f5f9",
            p: 0.5,
            "&:hover": { backgroundColor: "#e2e8f0", color: "#0f172a" },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Cart Items List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                backgroundColor: "#ffffff",
                border: "2px dashed #cbd5e1",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 28, color: "#94a3b8" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5, fontSize: "0.9rem" }}>
              Your cart is empty
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", maxWidth: 220, mx: "auto", mb: 2.5 }}>
              Add items from Smartphones, Accessories, or Repairs.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={closeCart}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#cbd5e1",
                color: "#475569",
                fontSize: "0.8rem",
              }}
            >
              Explore Products
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {items.map((item) => (
              <Card
                key={item.id}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(30, 64, 175, 0.07)",
                    borderColor: "#93c5fd",
                  },
                }}
              >
                <CardContent sx={{ p: "10px 12px", "&:last-child": { pb: "10px" } }}>
                  {/* Product Info */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
                    <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "#1e40af", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {item.brand}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.82rem", lineHeight: 1.3, mt: 0.15 }} noWrap>
                        {item.model}
                      </Typography>
                      {item.storage && (
                        <Chip
                          label={item.storage}
                          size="small"
                          sx={{
                            mt: 0.4,
                            height: 16,
                            backgroundColor: "#eff6ff",
                            color: "#1e40af",
                            fontWeight: 700,
                            fontSize: "0.6rem",
                            border: "1px solid #dbeafe",
                            "& .MuiChip-label": { px: 0.75 },
                          }}
                        />
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      sx={{
                        p: 0.35,
                        color: "#ef4444",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fee2e2",
                        flexShrink: 0,
                        "&:hover": { backgroundColor: "#fee2e2" },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "0.85rem" }} />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 0.75, borderColor: "#f1f5f9" }} />

                  {/* Price row + qty controls */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.68rem", color: "#64748b" }}>Subtotal</Typography>
                      <Typography sx={{ fontWeight: 800, color: "#1e40af", fontSize: "0.85rem" }}>
                        Rs. {(item.price * item.quantity).toLocaleString("en-LK")}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        backgroundColor: "#f8fafc",
                        borderRadius: 1.5,
                        p: "3px 4px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        sx={{
                          p: "2px",
                          color: "#1e40af",
                          backgroundColor: "#ffffff",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          "&:hover": { backgroundColor: "#eff6ff" },
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: "0.75rem" }} />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, textAlign: "center", fontWeight: 800, fontSize: "0.8rem", color: "#0f172a" }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        sx={{
                          p: "2px",
                          color: "#1e40af",
                          backgroundColor: "#ffffff",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          "&:hover": { backgroundColor: "#eff6ff" },
                        }}
                      >
                        <AddIcon sx={{ fontSize: "0.75rem" }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer / Checkout summary */}
      {items.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Summary rows */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Total Items</Typography>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>{totalQuantity}</Typography>
          </Box>

          {/* Grand Total Box */}
          <Paper
            sx={{
              px: 2,
              py: 1.25,
              background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
              borderRadius: 1.5,
              mb: 1.25,
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.68rem", display: "block" }}>
                Grand Total
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1 }}>
                Rs. {getTotalPrice().toLocaleString("en-LK")}
              </Typography>
            </Box>
            <Chip
              label="LKR"
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.68rem",
                height: 20,
              }}
            />
          </Paper>

          {/* Action Buttons */}
          <Link href="/billing" style={{ textDecoration: "none" }} onClick={closeCart}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: "0.9rem" }} />}
              sx={{
                background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                fontWeight: 700,
                py: 0.9,
                fontSize: "0.82rem",
                textTransform: "none",
                borderRadius: 1.5,
                boxShadow: "0 3px 10px rgba(30, 64, 175, 0.25)",
                mb: 0.75,
                "&:hover": { background: "linear-gradient(135deg, #1e3a8a, #2563eb)" },
              }}
            >
              Proceed to Billing
            </Button>
          </Link>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={closeCart}
            sx={{
              fontWeight: 600,
              py: 0.7,
              fontSize: "0.78rem",
              textTransform: "none",
              borderColor: "#cbd5e1",
              color: "#64748b",
              borderRadius: 1.5,
              "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

