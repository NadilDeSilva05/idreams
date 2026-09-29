"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { Accessory, AccessoryStockItem } from "@/hooks/useAccessories";

interface AccessoryStockModalProps {
  open: boolean;
  onClose: () => void;
  accessory: Accessory | null;
  onAddStock: (
    accessoryId: string,
    stock: Omit<AccessoryStockItem, "id" | "createdAt"> | Omit<AccessoryStockItem, "id" | "createdAt">[]
  ) => Promise<void>;
  onDeleteStock: (accessoryId: string, stockId: string) => Promise<void>;
  isOwner: boolean;
}

interface StockRow {
  id: string;
  quantity: string;
  purchasePrice: string;
  supplier: string;
  notes: string;
}

const createInitialRow = (): StockRow => ({
  id: "row_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
  quantity: "1",
  purchasePrice: "",
  supplier: "",
  notes: "",
});

export default function AccessoryStockModal({
  open,
  onClose,
  accessory,
  onAddStock,
  onDeleteStock,
  isOwner,
}: AccessoryStockModalProps) {
  const [stockRows, setStockRows] = useState<StockRow[]>([createInitialRow()]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (open) {
      setStockRows([createInitialRow()]);
      setRowErrors({});
      setSubmitError("");
      setShowAddForm(false);
    }
  }, [open, accessory]);

  const handleClose = () => {
    setRowErrors({});
    setSubmitError("");
    onClose();
  };

  const handleAddRow = () => {
    setStockRows((prev) => [...prev, createInitialRow()]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (stockRows.length <= 1) return;
    setStockRows((prev) => prev.filter((r) => r.id !== rowId));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const handleRowChange = (rowId: string, field: keyof StockRow, value: string) => {
    setStockRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
    if (field === "quantity" && rowErrors[rowId]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessory || !accessory.id || !isOwner) return;

    const newErrors: Record<string, string> = {};
    const validStocks: Omit<AccessoryStockItem, "id" | "createdAt">[] = [];

    stockRows.forEach((row, idx) => {
      const q = Number(row.quantity);
      if (!row.quantity || isNaN(q) || q < 1) {
        newErrors[row.id] = `Row #${idx + 1}: Quantity must be at least 1`;
      } else {
        validStocks.push({
          quantity: Math.floor(q),
          purchasePrice: row.purchasePrice ? Number(row.purchasePrice) : undefined,
          supplier: row.supplier.trim() || undefined,
          notes: row.notes.trim() || undefined,
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setRowErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onAddStock(accessory.id, validStocks);
      setSubmitting(false);
      setStockRows([createInitialRow()]);
      setRowErrors({});
      setSubmitError("");
      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error adding stock:", err);
      setSubmitError(err?.message || "Failed to add stock entries. Please try again.");
      setSubmitting(false);
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    if (!accessory?.id || !isOwner) return;
    try {
      setDeletingId(stockId);
      await onDeleteStock(accessory.id, stockId);
    } catch (err) {
      console.error("Error deleting stock:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!accessory) return null;

  const stocks = accessory.stocks || [];
  const totalQty = stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-LK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 45px rgba(234, 88, 12, 0.16)",
            maxHeight: "92vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #ea580c 0%, #7c3aed 100%)",
          color: "#ffffff",
          py: 2.2,
          px: 3,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 0.8,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 2,
              display: "flex",
            }}
          >
            <WarehouseIcon sx={{ fontSize: 24, color: "#ffffff" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Stock Management
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 600 }}>
              {accessory.brand} — {accessory.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          backgroundColor: "#ffffff",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
        dividers
      >
        {/* Summary Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 800, textTransform: "uppercase" }}>
              {accessory.brand}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b" }}>
              {accessory.name}
            </Typography>
            {accessory.specifications && (
              <Chip
                label={accessory.specifications}
                size="small"
                sx={{ mt: 0.5, backgroundColor: "#ffffff", color: "#ea580c", fontWeight: 600, fontSize: "0.72rem" }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#ea580c" }}>
                {totalQty}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Total Units
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#7c3aed" }}>
                {stocks.length}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Stock Entries
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Existing Stocks Table */}
        {stocks.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e293b", mb: 1.5 }}>
              Stock Entries
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Date Added</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Purchase Price</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Notes</TableCell>
                    {isOwner && (
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>
                        Action
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock.id} hover>
                      <TableCell sx={{ color: "#64748b", fontSize: "0.82rem" }}>
                        {formatDate(stock.createdAt)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={stock.quantity}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            backgroundColor: "#fff7ed",
                            color: "#ea580c",
                            minWidth: 36,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#475569", fontSize: "0.82rem" }}>
                        {stock.purchasePrice
                          ? `Rs. ${stock.purchasePrice.toLocaleString("en-LK")}`
                          : "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#475569", fontSize: "0.82rem" }}>
                        {stock.supplier || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#64748b", fontSize: "0.78rem", maxWidth: 150 }}>
                        {stock.notes || "—"}
                      </TableCell>
                      {isOwner && (
                        <TableCell align="center">
                          <Tooltip title="Delete this stock entry">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteStock(stock.id)}
                              disabled={deletingId === stock.id}
                              sx={{ color: "#ef4444", "&:hover": { backgroundColor: "#fef2f2" } }}
                            >
                              {deletingId === stock.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {stocks.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              textAlign: "center",
              border: "2px dashed #e2e8f0",
              borderRadius: 2.5,
            }}
          >
            <InventoryIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
              No stock entries yet.
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              {isOwner ? "Add your first stock batch below." : "No stock has been added for this accessory."}
            </Typography>
          </Paper>
        )}

        {/* Add Stock Form — owners only */}
        {isOwner && (
          <>
            {!showAddForm ? (
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={() => setShowAddForm(true)}
                fullWidth
                sx={{
                  borderColor: "#ea580c",
                  color: "#ea580c",
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: "none",
                  borderStyle: "dashed",
                  borderWidth: 2,
                  py: 1.25,
                  "&:hover": { borderColor: "#c2410c", backgroundColor: "#fff7ed", borderStyle: "dashed", borderWidth: 2 },
                }}
              >
                + Add New Stock Entry
              </Button>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "2px solid #ea580c",
                  borderRadius: 2.5,
                  backgroundColor: "#fff7ed",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#ea580c" }}>
                      Add Stock Entries
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#78350f" }}>
                      Add single or multiple stock batches simultaneously
                    </Typography>
                  </Box>
                  <Chip
                    label={`${stockRows.length} ${stockRows.length > 1 ? "Entries" : "Entry"} • ${stockRows.reduce(
                      (sum, r) => sum + (parseInt(r.quantity, 10) || 0),
                      0
                    )} Total Units`}
                    size="small"
                    sx={{ backgroundColor: "#ea580c", color: "#ffffff", fontWeight: 700, fontSize: "0.72rem" }}
                  />
                </Box>

                {submitError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {submitError}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    {stockRows.map((row, index) => (
                      <Paper
                        key={row.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: "#ffffff",
                          borderRadius: 2,
                          border: rowErrors[row.id] ? "1.5px solid #ef4444" : "1px solid #fed7aa",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#ea580c", textTransform: "uppercase" }}>
                            Stock Batch #{index + 1}
                          </Typography>
                          {stockRows.length > 1 && (
                            <Tooltip title="Remove this batch row">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveRow(row.id)}
                                sx={{ color: "#ef4444", p: 0.5, "&:hover": { backgroundColor: "#fef2f2" } }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>

                        <Grid container spacing={2}>
                          {/* Quantity */}
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Quantity *"
                              type="number"
                              value={row.quantity}
                              onChange={(e) => handleRowChange(row.id, "quantity", e.target.value)}
                              error={Boolean(rowErrors[row.id])}
                              helperText={rowErrors[row.id]}
                              slotProps={{
                                htmlInput: { min: 1, step: 1 },
                              }}
                              sx={{ backgroundColor: "#ffffff" }}
                            />
                          </Grid>

                          {/* Purchase Price */}
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Purchase Price"
                              type="number"
                              placeholder="e.g. 1500"
                              value={row.purchasePrice}
                              onChange={(e) => handleRowChange(row.id, "purchasePrice", e.target.value)}
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                },
                                htmlInput: { min: 0, step: 50 },
                              }}
                              sx={{ backgroundColor: "#ffffff" }}
                            />
                          </Grid>

                          {/* Supplier */}
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Supplier"
                              placeholder="e.g. Singer, Daraz"
                              value={row.supplier}
                              onChange={(e) => handleRowChange(row.id, "supplier", e.target.value)}
                              sx={{ backgroundColor: "#ffffff" }}
                            />
                          </Grid>

                          {/* Notes */}
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Notes"
                              placeholder="e.g. Box batch A"
                              value={row.notes}
                              onChange={(e) => handleRowChange(row.id, "notes", e.target.value)}
                              sx={{ backgroundColor: "#ffffff" }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}

                    {/* Add Another Row Button */}
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddCircleIcon sx={{ fontSize: 16 }} />}
                        onClick={handleAddRow}
                        sx={{
                          borderColor: "#ea580c",
                          color: "#ea580c",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          textTransform: "none",
                          borderRadius: 1.5,
                          backgroundColor: "#ffffff",
                          "&:hover": { borderColor: "#c2410c", backgroundColor: "#fff7ed" },
                        }}
                      >
                        + Add Another Stock Batch Row
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", pt: 1, borderTop: "1px dashed #fed7aa" }}>
                      <Button
                        onClick={() => {
                          setShowAddForm(false);
                          setStockRows([createInitialRow()]);
                          setRowErrors({});
                          setSubmitError("");
                        }}
                        disabled={submitting}
                        sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        startIcon={
                          submitting ? <CircularProgress size={18} color="inherit" /> : <AddCircleIcon />
                        }
                        sx={{
                          background: "linear-gradient(135deg, #ea580c 0%, #7c3aed 100%)",
                          fontWeight: 700,
                          textTransform: "none",
                          px: 3,
                          py: 1,
                          borderRadius: 1.75,
                          boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #c2410c 0%, #6d28d9 100%)",
                          },
                        }}
                      >
                        {submitting
                          ? "Adding..."
                          : stockRows.length > 1
                            ? `Add All (${stockRows.length}) Stock Entries`
                            : "Add Stock Entry"}
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </Paper>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
