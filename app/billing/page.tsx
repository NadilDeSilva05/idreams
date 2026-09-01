"use client";

import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CartButton, PersistentCart } from "@/components/cart/persistent-cart";

type BillStatus = "Paid" | "Pending" | "Partial" | "Draft";

type BillItem = {
  name: string;
  qty: number;
  price: number;
};

type Bill = {
  id: string;
  customer: string;
  phone: string;
  date: string;
  dueDate: string;
  itemCount: number;
  status: BillStatus;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  note: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(value);

const initialBills: Bill[] = [
  {
    id: "INV-2026-001",
    customer: "Kasun Perera",
    phone: "+94 77 123 4567",
    date: "2026-08-29",
    dueDate: "2026-09-05",
    itemCount: 3,
    status: "Paid",
    items: [
      { name: "iPhone 15 Pro", qty: 1, price: 390000 },
      { name: "Phone Case", qty: 2, price: 8500 },
      { name: "Repair Service", qty: 1, price: 18500 },
    ],
    subtotal: 417000,
    tax: 25020,
    discount: 0,
    total: 442020,
    note: "Premium support and 1-year case warranty included.",
  },
  {
    id: "INV-2026-002",
    customer: "Nimali Fernando",
    phone: "+94 71 889 0123",
    date: "2026-08-27",
    dueDate: "2026-09-03",
    itemCount: 2,
    status: "Pending",
    items: [
      { name: "Samsung Galaxy S24", qty: 1, price: 288000 },
      { name: "Fast Charger", qty: 1, price: 14500 },
    ],
    subtotal: 302500,
    tax: 18150,
    discount: 5000,
    total: 315650,
    note: "Payment due before delivery.",
  },
  {
    id: "INV-2026-003",
    customer: "Rahul Jayasinghe",
    phone: "+94 76 345 7788",
    date: "2026-08-20",
    dueDate: "2026-08-30",
    itemCount: 4,
    status: "Partial",
    items: [
      { name: "Repair Diagnosis", qty: 1, price: 12000 },
      { name: "Laptop Screen", qty: 1, price: 68000 },
      { name: "Keyboard Cover", qty: 1, price: 4200 },
      { name: "Cleaning Kit", qty: 1, price: 3500 },
    ],
    subtotal: 87700,
    tax: 5262,
    discount: 0,
    total: 92962,
    note: "Partial payment received via bank transfer.",
  },
];

const defaultDraft = {
  customer: "Ayesha Silva",
  phone: "+94 77 678 9012",
  itemName: "Wireless Earbuds",
  qty: "1",
  price: "24000",
  note: "Customer requested gift packaging.",
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [selectedBillId, setSelectedBillId] = useState(initialBills[0].id);
  const [draft, setDraft] = useState(defaultDraft);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const selectedBill = bills.find((bill) => bill.id === selectedBillId) ?? bills[0];

  const totals = useMemo(() => {
    const paid = bills.filter((bill) => bill.status === "Paid").length;
    const pending = bills.filter((bill) => bill.status === "Pending").length;
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
    return { paid, pending, totalRevenue };
  }, [bills]);

  const draftSubtotal = Number(draft.price) * Number(draft.qty || 1);
  const draftTax = draftSubtotal * 0.08;
  const draftTotal = draftSubtotal + draftTax;

  const handleCreateBill = () => {
    const nextBill: Bill = {
      id: `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, "0")}`,
      customer: draft.customer,
      phone: draft.phone,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      itemCount: Number(draft.qty || 1),
      status: "Pending",
      items: [
        {
          name: draft.itemName,
          qty: Number(draft.qty || 1),
          price: Number(draft.price),
        },
      ],
      subtotal: draftSubtotal,
      tax: Number(draftTax.toFixed(2)),
      discount: 0,
      total: Number(draftTotal.toFixed(2)),
      note: draft.note,
    };

    setBills((previous) => [nextBill, ...previous]);
    setSelectedBillId(nextBill.id);
    setShowCreateForm(false);
    setDraft(defaultDraft);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(30, 64, 175, 0.08)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "#1e40af", display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptLongIcon sx={{ color: "#1e40af" }} />
              Billing & Invoices
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
              sx={{
                background: "linear-gradient(135deg, #1e40af, #1e3a8a)",
                fontWeight: 700,
              }}
            >
              New Bill
            </Button>
            <CartButton />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>Total Bills</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>{bills.length}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>Paid</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#059669" }}>{totals.paid}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>Pending</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#ea580c" }}>{totals.pending}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e40af" }}>
                  {formatCurrency(totals.totalRevenue)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 2, border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Bills List
                  </Typography>
                  <Chip label="Live Ledger" color="primary" variant="outlined" />
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bill ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: "#1e40af" }}>{bill.id}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>{bill.customer}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>{bill.phone}</Typography>
                          </TableCell>
                          <TableCell>{bill.date}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(bill.total)}</TableCell>
                          <TableCell>
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
                              variant={bill.status === "Paid" ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => setSelectedBillId(bill.id)}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PrintIcon />}
                              onClick={handlePrint}
                            >
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card className="bill-print-area" sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <Box sx={{ background: "linear-gradient(135deg, #1e40af, #1e3a8a)", px: 3, py: 2.5, color: "#fff" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1.2 }}>iDREAMS</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice</Typography>
                    </Box>
                    <ReceiptLongIcon sx={{ fontSize: 36 }} />
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Bill Number</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{selectedBill.id}</Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>Date</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{selectedBill.date}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Customer</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{selectedBill.customer}</Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>{selectedBill.phone}</Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {selectedBill.items.map((item) => (
                    <Box key={`${selectedBill.id}-${item.name}`} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Qty {item.qty}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700 }}>{formatCurrency(item.qty * item.price)}</Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "#64748b" }}>Subtotal</Typography>
                      <Typography>{formatCurrency(selectedBill.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "#64748b" }}>Tax</Typography>
                      <Typography>{formatCurrency(selectedBill.tax)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "#64748b" }}>Discount</Typography>
                      <Typography>{formatCurrency(selectedBill.discount)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid #e2e8f0" }}>
                      <Typography sx={{ fontWeight: 800 }}>Total</Typography>
                      <Typography sx={{ fontWeight: 800, color: "#1e40af" }}>{formatCurrency(selectedBill.total)}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Note</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedBill.note}</Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ mt: 3, background: "linear-gradient(135deg, #1e40af, #1e3a8a)", fontWeight: 700 }}
                  >
                    Print Bill
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {showCreateForm && (
            <Paper
              sx={{
                p: 3,
                mt: 4,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Create New Bill
                </Typography>
                <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                  Close
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={draft.customer}
                    onChange={(event) => setDraft((previous) => ({ ...previous, customer: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={draft.phone}
                    onChange={(event) => setDraft((previous) => ({ ...previous, phone: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    value={draft.itemName}
                    onChange={(event) => setDraft((previous) => ({ ...previous, itemName: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Qty"
                    value={draft.qty}
                    onChange={(event) => setDraft((previous) => ({ ...previous, qty: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    value={draft.price}
                    onChange={(event) => setDraft((previous) => ({ ...previous, price: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Notes"
                    value={draft.note}
                    onChange={(event) => setDraft((previous) => ({ ...previous, note: event.target.value }))}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Preview</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Typography sx={{ color: "#64748b" }}>Subtotal</Typography>
                  <Typography>{formatCurrency(draftSubtotal)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#64748b" }}>Tax</Typography>
                  <Typography>{formatCurrency(draftTax)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid #e2e8f0" }}>
                  <Typography sx={{ fontWeight: 800 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 800, color: "#1e40af" }}>{formatCurrency(draftTotal)}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleCreateBill} sx={{ background: "linear-gradient(135deg, #1e40af, #1e3a8a)" }}>
                  Save Bill
                </Button>
              </Box>
            </Paper>
          )}

        </Container>
      </Box>
      <PersistentCart />
    </Box>
  );
}
