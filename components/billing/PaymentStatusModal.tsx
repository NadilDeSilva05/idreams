"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Bill, BillStatus } from "./InvoiceReceiptView";

interface PaymentStatusModalProps {
  open: boolean;
  onClose: () => void;
  bill: Bill | null;
  onUpdate: (updatedBill: Bill) => void;
}

export default function PaymentStatusModal({
  open,
  onClose,
  bill,
  onUpdate,
}: PaymentStatusModalProps) {
  const [status, setStatus] = useState<BillStatus>("Paid");
  const [paymentMethod, setPaymentMethod] = useState<Bill["paymentMethod"]>("Cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (bill) {
      setStatus(bill.status);
      setPaymentMethod(bill.paymentMethod);
      setAmountPaid(String(bill.amountPaid || bill.total));
      setNote(bill.note || "");
    }
  }, [bill]);

  if (!bill) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paidNum = Number(amountPaid) || 0;
    const updated: Bill = {
      ...bill,
      status,
      paymentMethod,
      amountPaid: paidNum,
      note: note.trim(),
    };
    onUpdate(updated);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
          color: "#ffffff",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PointOfSaleIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Update Invoice Settlement
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          <Box sx={{ p: 2, backgroundColor: "#f5f3ff", borderRadius: 2, mb: 2.5, border: "1px solid #ddd6fe" }}>
            <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700 }}>
              {bill.id} • {bill.customer}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Total: Rs. {bill.total.toLocaleString("en-LK")}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Status */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small" sx={{ backgroundColor: "#ffffff" }}>
                <InputLabel>Settlement Status</InputLabel>
                <Select
                  value={status}
                  label="Settlement Status"
                  onChange={(e) => setStatus(e.target.value as BillStatus)}
                >
                  <MenuItem value="Paid">Paid (Full Settlement)</MenuItem>
                  <MenuItem value="Partial">Partial Payment</MenuItem>
                  <MenuItem value="Pending">Pending Payment</MenuItem>
                  <MenuItem value="Draft">Draft Invoice</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Payment Method */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small" sx={{ backgroundColor: "#ffffff" }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <MenuItem value="Cash">Cash at Counter</MenuItem>
                  <MenuItem value="Card">Credit / Debit Card</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer / LankaQR</MenuItem>
                  <MenuItem value="Installment">Installment Plan</MenuItem>
                  <MenuItem value="Split">Split Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Amount Paid */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Amount Paid in LKR"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  },
                }}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Payment Note / Transaction Reference"
                placeholder="e.g., Paid via Commercial Bank Visa ending 4421"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={onClose} sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
            }}
          >
            Save Settlement
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
