"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Bill, BillItem, BillStatus } from "./InvoiceReceiptView";

interface PosCheckoutTerminalProps {
  onSaveBill: (bill: Bill, autoPrint?: boolean) => void;
  nextInvoiceNumber: string;
}

export default function PosCheckoutTerminal({
  onSaveBill,
  nextInvoiceNumber,
}: PosCheckoutTerminalProps) {
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();

  // Customer Info - ONLY Name and Contact No
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");

  // Line items in current transaction (starts empty or converted from cart)
  const [lineItems, setLineItems] = useState<BillItem[]>(() => {
    if (cartItems.length > 0) {
      return cartItems.map((item) => {
        const lineItem: BillItem = {
          name: `${item.brand} ${item.model}${item.storage ? ` (${item.storage})` : ""}${item.imei ? ` • IMEI: ${item.imei}` : ""}`,
          qty: item.quantity,
          price: item.price,
          warranty: item.brand === "Apple" || item.brand === "Samsung" ? "1 Year Official" : "6 Months",
        };
        if (item.smartphoneId) lineItem.smartphoneId = item.smartphoneId;
        if (item.stockItemId) lineItem.stockItemId = item.stockItemId;
        if (item.imei) lineItem.imei = item.imei;
        if (item.type) lineItem.type = item.type;
        if (item.brand) lineItem.brand = item.brand;
        if (item.model) lineItem.model = item.model;
        if (item.storage) lineItem.storage = item.storage;
        return lineItem;
      });
    }
    return [];
  });

  // Quick custom item inputs
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQty, setCustomItemQty] = useState("1");
  const [customItemWarranty, setCustomItemWarranty] = useState("6 Months");

  // Payment & Calculations
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Bill["paymentMethod"]>("Cash");
  const [paymentStatus] = useState<BillStatus>("Paid");
  const [note] = useState("Direct Store Purchase.");
  const cashier = user?.name ? `${user.name} (${user.shopName || "Cashier"})` : "Store Cashier";

  // Import from cart
  const handleLoadFromCart = () => {
    if (cartItems.length === 0) return;
    const convertedItems: BillItem[] = cartItems.map((item) => {
      const lineItem: BillItem = {
        name: `${item.brand} ${item.model}${item.storage ? ` (${item.storage})` : ""}${item.imei ? ` • IMEI: ${item.imei}` : ""}`,
        qty: item.quantity,
        price: item.price,
        warranty: item.brand === "Apple" || item.brand === "Samsung" ? "1 Year Official" : "6 Months",
      };
      if (item.smartphoneId) lineItem.smartphoneId = item.smartphoneId;
      if (item.stockItemId) lineItem.stockItemId = item.stockItemId;
      if (item.imei) lineItem.imei = item.imei;
      if (item.type) lineItem.type = item.type;
      if (item.brand) lineItem.brand = item.brand;
      if (item.model) lineItem.model = item.model;
      if (item.storage) lineItem.storage = item.storage;
      return lineItem;
    });
    setLineItems(convertedItems);
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount =
    discountType === "percent"
      ? (subtotal * discountValue) / 100
      : Math.min(subtotal, discountValue);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Line item handlers
  const handleAddCustomItem = () => {
    if (!customItemName.trim() || Number(customItemPrice) <= 0) return;
    const newItem: BillItem = {
      name: customItemName.trim(),
      price: Number(customItemPrice),
      qty: Math.max(1, Number(customItemQty) || 1),
      ...(customItemWarranty.trim() ? { warranty: customItemWarranty.trim() } : {}),
    };
    setLineItems([...lineItems, newItem]);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQty("1");
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveLineItem(index);
      return;
    }
    const updated = [...lineItems];
    updated[index].qty = newQty;
    setLineItems(updated);
  };

  const handleCompleteSale = (autoPrint = false) => {
    if (lineItems.length === 0) return;

    const newBill: Bill = {
      id: nextInvoiceNumber,
      customer: customer.trim() || "Walk-in Customer",
      phone: phone.trim() || "+94 7X XXX XXXX",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" }),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      itemCount: lineItems.reduce((acc, i) => acc + i.qty, 0),
      status: paymentStatus,
      paymentMethod,
      items: lineItems,
      subtotal,
      tax: 0,
      discount: discountAmount,
      total: grandTotal,
      amountPaid: paymentStatus === "Paid" ? grandTotal : 0,
      cashier,
      note,
    };

    onSaveBill(newBill, autoPrint);

    // If imported from cart, clean cart
    if (cartItems.length > 0) {
      clearCart();
    }

    // Reset form
    setCustomer("");
    setPhone("");
    setLineItems([]);
    setDiscountValue(0);
  };

  return (
    <Box>
      {/* Top Banner / Cart Importer Bar */}
      <Paper
        sx={{
          p: 1.75,
          mb: 2.5,
          borderRadius: 2,
          border: "1px solid #ddd6fe",
          backgroundColor: "#f5f3ff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PointOfSaleIcon sx={{ fontSize: 19 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.92rem" }}>
              POS Checkout • Next Bill ID: {nextInvoiceNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: "#475569" }}>
              Quick billing terminal for in-store sales and cart checkouts.
            </Typography>
          </Box>
        </Box>

        {cartItems.length > 0 && (
          <Button
            variant="contained"
            size="small"
            startIcon={<ShoppingBagIcon />}
            onClick={handleLoadFromCart}
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1.5,
              py: 0.6,
              fontSize: "0.82rem",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.2)",
            }}
          >
            Load Active Cart ({cartItems.length} items)
          </Button>
        )}
      </Paper>

      <Grid container spacing={2.5}>
        {/* LEFT COLUMN: Customer + Line Items (Spacious 8 cols) */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Customer Details Box - ONLY Name and Contact No */}
          <Paper sx={{ p: 2, mb: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e293b", mb: 1.5, display: "flex", alignItems: "center", gap: 0.75 }}>
              <PersonIcon sx={{ color: "#7c3aed", fontSize: 17 }} />
              Customer Information
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer Name"
                  placeholder="e.g., Kasun Perera (Walk-in)"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Number"
                  placeholder="e.g., +94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Current Line Items Table (Zero Scroll, Compact Margins) */}
          <Paper sx={{ p: 2, mb: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 0.75 }}>
                <ShoppingBagIcon sx={{ color: "#7c3aed", fontSize: 17 }} />
                Line Items ({lineItems.length})
              </Typography>
              {lineItems.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => setLineItems([])}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", p: 0 }}
                >
                  Clear Items
                </Button>
              )}
            </Box>

            {lineItems.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 1.5, border: "1px dashed #cbd5e1" }}>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  No items in this transaction yet.
                </Typography>
                {cartItems.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShoppingBagIcon />}
                    onClick={handleLoadFromCart}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8rem" }}
                  >
                    Load Items from Active Cart
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer sx={{ border: "1px solid #f1f5f9", borderRadius: 1.5, mb: 2, width: "100%", overflowX: "hidden" }}>
                <Table size="small" sx={{ width: "100%", tableLayout: "auto" }}>
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: "#475569", px: 1.25, py: 1 }}>Item & Warranty</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569", px: 1, py: 1, width: 90 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569", px: 1, py: 1, width: 110 }}>Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569", px: 1.25, py: 1, width: 110 }}>Total</TableCell>
                      <TableCell align="center" sx={{ width: 36, px: 0.5, py: 1 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItems.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ px: 1.25, py: 0.85, wordBreak: "break-word" }}>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.84rem", color: "#0f172a", lineHeight: 1.2 }}>
                            {item.name}
                          </Typography>
                          {item.warranty && (
                            <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600, display: "block", fontSize: "0.72rem" }}>
                              ✓ {item.warranty}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ px: 1, py: 0.85 }}>
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, backgroundColor: "#f8fafc", p: "1px 3px", borderRadius: 1, border: "1px solid #e2e8f0" }}>
                            <IconButton size="small" onClick={() => handleUpdateQty(idx, item.qty - 1)} sx={{ p: 0.2 }}>
                              <RemoveIcon sx={{ fontSize: "0.7rem" }} />
                            </IconButton>
                            <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", minWidth: 16, textAlign: "center" }}>
                              {item.qty}
                            </Typography>
                            <IconButton size="small" onClick={() => handleUpdateQty(idx, item.qty + 1)} sx={{ p: 0.2 }}>
                              <AddIcon sx={{ fontSize: "0.7rem" }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.82rem", color: "#475569", px: 1, py: 0.85, whiteSpace: "nowrap" }}>
                          Rs. {item.price.toLocaleString("en-LK")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "0.86rem", px: 1.25, py: 0.85, whiteSpace: "nowrap" }}>
                          Rs. {(item.qty * item.price).toLocaleString("en-LK")}
                        </TableCell>
                        <TableCell align="center" sx={{ px: 0.5, py: 0.85 }}>
                          <IconButton size="small" onClick={() => handleRemoveLineItem(idx)} sx={{ color: "#ef4444", p: 0.3 }}>
                            <DeleteIcon sx={{ fontSize: "0.85rem" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Quick Add Custom Item Form (Compact margins) */}
            <Box sx={{ p: 1.5, backgroundColor: "#f8fafc", borderRadius: 1.5, border: "1px dashed #cbd5e1" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", mb: 1, fontSize: "0.72rem" }}>
                + Add Custom Item / Service:
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Item Name / Service"
                    placeholder="e.g., Phone Case, Screen Guard"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    sx={{ backgroundColor: "#ffffff" }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Price (LKR)"
                    placeholder="2500"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    slotProps={{ htmlInput: { min: 0, step: 100 } }}
                    sx={{ backgroundColor: "#ffffff" }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Qty"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={{ backgroundColor: "#ffffff" }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomItem}
                    disabled={!customItemName.trim() || Number(customItemPrice) <= 0}
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                      fontWeight: 700,
                      py: 0.85,
                      textTransform: "none",
                      height: "100%",
                      fontSize: "0.8rem",
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Payment Method, Discount & Simple Checkout */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#ffffff", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5, fontSize: "0.95rem" }}>
              Payment Method
            </Typography>

            {/* Payment Method Selector */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 2 }}>
              {[
                { id: "Cash", label: "Cash", icon: LocalAtmIcon, color: "#059669" },
                { id: "Card", label: "Card", icon: CreditCardIcon, color: "#7c3aed" },
                { id: "Bank Transfer", label: "Transfer / QR", icon: AccountBalanceIcon, color: "#ea580c" },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <Button
                    key={m.id}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => setPaymentMethod(m.id as any)}
                    sx={{
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25,
                      borderRadius: 1.5,
                      textTransform: "none",
                      borderColor: isSelected ? "transparent" : "#cbd5e1",
                      backgroundColor: isSelected ? m.color : "#ffffff",
                      color: isSelected ? "#ffffff" : "#334155",
                      fontWeight: 700,
                      "&:hover": {
                        backgroundColor: isSelected ? m.color : "#f8fafc",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{m.label}</Typography>
                  </Button>
                );
              })}
            </Box>

            {/* Discount Control */}
            <Box sx={{ p: 1.75, backgroundColor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0", mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", mb: 0.75, fontSize: "0.72rem" }}>
                Discount:
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Discount Value"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {discountType === "percent" ? "%" : "Rs."}
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { min: 0 },
                  }}
                  sx={{ flex: 1, backgroundColor: "#ffffff" }}
                />
                <ButtonGroup size="small">
                  <Button
                    variant={discountType === "fixed" ? "contained" : "outlined"}
                    onClick={() => setDiscountType("fixed")}
                    sx={{ textTransform: "none", fontWeight: 700, px: 1 }}
                  >
                    LKR
                  </Button>
                  <Button
                    variant={discountType === "percent" ? "contained" : "outlined"}
                    onClick={() => setDiscountType("percent")}
                    sx={{ textTransform: "none", fontWeight: 700, px: 1 }}
                  >
                    %
                  </Button>
                </ButtonGroup>
              </Box>

              {/* Quick discount chips */}
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {[
                  { label: "0%", val: 0, type: "percent" as const },
                  { label: "5% Off", val: 5, type: "percent" as const },
                  { label: "10% Off", val: 10, type: "percent" as const },
                  { label: "Rs. 1k Off", val: 1000, type: "fixed" as const },
                ].map((d, i) => (
                  <Chip
                    key={i}
                    label={d.label}
                    size="small"
                    onClick={() => {
                      setDiscountType(d.type);
                      setDiscountValue(d.val);
                    }}
                    sx={{
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.68rem",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      height: 22,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Financial Summary Card */}
            <Box sx={{ display: "grid", gap: 0.75, mb: 2.5, pt: 0.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>Subtotal ({lineItems.length} items)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>Rs. {subtotal.toLocaleString("en-LK")}</Typography>
              </Box>

              {discountAmount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#ef4444", fontSize: "0.85rem" }}>Discount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#ef4444", fontSize: "0.85rem" }}>- Rs. {discountAmount.toLocaleString("en-LK")}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 0.25 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>Total Amount</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: "1.25rem", color: "#7c3aed" }}>
                  Rs. {grandTotal.toLocaleString("en-LK")}
                </Typography>
              </Box>
            </Box>

            {/* Checkout Action Buttons */}
            <Box sx={{ display: "grid", gap: 1.25 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ReceiptIcon />}
                disabled={lineItems.length === 0}
                onClick={() => handleCompleteSale(true)}
                sx={{
                  background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                  fontWeight: 800,
                  py: 1.25,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  borderRadius: 1.5,
                  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                }}
              >
                Complete & Print Receipt
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
