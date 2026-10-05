"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Tooltip,
  Alert,
  Stack,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery90Icon from "@mui/icons-material/Battery90";
import Battery60Icon from "@mui/icons-material/Battery60";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import StorageIcon from "@mui/icons-material/Storage";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaletteIcon from "@mui/icons-material/Palette";
import NotesIcon from "@mui/icons-material/Notes";
import { GroupedSmartphone, SmartphoneStockItem } from "@/types/smartphone";

interface ViewStockModalProps {
  open: boolean;
  onClose: () => void;
  smartphone: GroupedSmartphone | null;
  onOpenAddStock: (smartphone: GroupedSmartphone) => void;
  onDeleteStock: (smartphoneId: string, stockId: string) => Promise<void>;
  isOwner?: boolean;
  condition?: "Brand New" | "Used";
}

export default function ViewStockModal({
  open,
  onClose,
  smartphone,
  onOpenAddStock,
  onDeleteStock,
  isOwner = true,
  condition = "Brand New",
}: ViewStockModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedImei, setCopiedImei] = useState<string | null>(null);

  // Deletion confirmation state
  const [stockToDelete, setStockToDelete] = useState<SmartphoneStockItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const stocks = smartphone?.stocks || [];

  // Filter stocks strictly by the phone's condition (Brand New or Used)
  const conditionStocks = useMemo(
    () => stocks.filter((s) => s.type === condition),
    [stocks, condition]
  );

  // Filter stocks according to search query
  const filteredStocks = useMemo(() => {
    return conditionStocks.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.imei.toLowerCase().includes(q) ||
        item.storage.toLowerCase().includes(q) ||
        (item.color && item.color.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [conditionStocks, searchQuery]);

  // Group filtered stocks by storage capacity
  const stocksByStorage = useMemo(() => {
    const map = new Map<string, SmartphoneStockItem[]>();

    // Sort order: numerical storage if possible, e.g. 64GB, 128GB, 256GB, 512GB, 1TB, 2TB
    filteredStocks.forEach((item) => {
      const key = item.storage || "Standard";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    });

    // Sort groups in ascending storage capacity
    const getSortWeight = (s: string) => {
      const match = s.match(/(\d+)\s*(GB|TB)/i);
      if (!match) return 9999;
      const num = parseInt(match[1], 10);
      const unit = match[2].toUpperCase();
      return unit === "TB" ? num * 1024 : num;
    };

    return Array.from(map.entries()).sort(
      ([a], [b]) => getSortWeight(a) - getSortWeight(b)
    );
  }, [filteredStocks]);

  const handleCopyImei = (imei: string) => {
    navigator.clipboard.writeText(imei);
    setCopiedImei(imei);
    setTimeout(() => {
      setCopiedImei(null);
    }, 2000);
  };

  const handleConfirmDelete = async () => {
    if (!smartphone?.id || !stockToDelete || !isOwner) return;
    try {
      setIsDeleting(true);
      await onDeleteStock(smartphone.id, stockToDelete.id);
      setStockToDelete(null);
      setIsDeleting(false);
    } catch (err) {
      console.error("Failed to delete stock item:", err);
      setIsDeleting(false);
    }
  };

  const renderBatteryChip = (item: SmartphoneStockItem) => {
    if (item.type === "Brand New") {
      return (
        <Chip
          icon={<BatteryChargingFullIcon sx={{ fontSize: "16px !important", color: "#059669 !important" }} />}
          label="100% (Brand New)"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            backgroundColor: "#ecfdf5",
            color: "#059669",
            border: "1px solid #a7f3d0",
          }}
        />
      );
    }

    const health = item.batteryHealth ?? 100;
    let icon = <Battery90Icon sx={{ fontSize: "16px !important", color: "#059669 !important" }} />;
    let bgColor = "#ecfdf5";
    let textColor = "#059669";
    let borderColor = "#a7f3d0";

    if (health < 80) {
      icon = <BatteryAlertIcon sx={{ fontSize: "16px !important", color: "#dc2626 !important" }} />;
      bgColor = "#fef2f2";
      textColor = "#dc2626";
      borderColor = "#fecaca";
    } else if (health < 88) {
      icon = <Battery60Icon sx={{ fontSize: "16px !important", color: "#d97706 !important" }} />;
      bgColor = "#fffbeb";
      textColor = "#d97706";
      borderColor = "#fde68a";
    }

    return (
      <Chip
        icon={icon}
        label={`${health}% Battery Health`}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "0.75rem",
          backgroundColor: bgColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
        }}
      />
    );
  };

  if (!smartphone) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.16)",
              overflow: "hidden",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              condition === "Brand New"
                ? "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)"
                : "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
            color: "#ffffff",
            py: 2.2,
            px: 3,
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
              <InventoryIcon sx={{ fontSize: 24, color: "#ffffff" }} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {smartphone.brand} {smartphone.model}
                </Typography>
                <Chip
                  label={condition}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 600 }}>
                {condition === "Brand New" ? "Factory Sealed Inventory" : "Pre-Owned Tested Inventory"} • {conditionStocks.length} available units
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Action Bar & Quick Stats */}
        <Box sx={{ px: 3, py: 2, backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Condition Stat Chip */}
            <Chip
              icon={
                condition === "Brand New" ? (
                  <NewReleasesIcon sx={{ fontSize: "16px !important", color: "#7c3aed !important" }} />
                ) : (
                  <HistoryToggleOffIcon sx={{ fontSize: "16px !important", color: "#ea580c !important" }} />
                )
              }
              label={`${condition} Stock: ${conditionStocks.length} available units`}
              sx={{
                backgroundColor: condition === "Brand New" ? "#f5f3ff" : "#fff7ed",
                color: condition === "Brand New" ? "#6d28d9" : "#c2410c",
                fontWeight: 800,
                fontSize: "0.82rem",
                border: `1.5px solid ${condition === "Brand New" ? "#ddd6fe" : "#fed7aa"}`,
                py: 2,
                px: 0.5,
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: { xs: 1, sm: "initial" } }}>
              <TextField
                size="small"
                placeholder={`Search ${condition} units by IMEI, color...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ minWidth: 260, backgroundColor: "#ffffff" }}
              />

              {/* Quick Add Stock Button */}
              {isOwner && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    onClose();
                    onOpenAddStock(smartphone);
                  }}
                  sx={{
                    background:
                      condition === "Brand New"
                        ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                        : "linear-gradient(135deg, #ea580c, #f97316)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    py: 0.9,
                    whiteSpace: "nowrap",
                    boxShadow:
                      condition === "Brand New"
                        ? "0 3px 10px rgba(124, 58, 237, 0.2)"
                        : "0 3px 10px rgba(234, 88, 12, 0.2)",
                  }}
                >
                  Add {condition} Stock
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Modal Main Scrollable Content */}
        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc", flex: 1, overflowY: "auto" }}>
          {conditionStocks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#ffffff",
                borderRadius: 3,
              }}
            >
              <InventoryIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}>
                No {condition} Stock Registered Yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 3, maxWidth: 380, mx: "auto" }}>
                There are currently no {condition.toLowerCase()} units in inventory for {smartphone.brand} {smartphone.model}.
              </Typography>
              {isOwner && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    onClose();
                    onOpenAddStock(smartphone);
                  }}
                  sx={{
                    background:
                      condition === "Brand New"
                        ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                        : "linear-gradient(135deg, #ea580c, #f97316)",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  Add First {condition} Unit
                </Button>
              )}
            </Paper>
          ) : filteredStocks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                No {condition} stock items match your search
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                Try searching with a different keyword or IMEI number.
              </Typography>
              <Button
                size="small"
                onClick={() => setSearchQuery("")}
                sx={{ color: condition === "Brand New" ? "#7c3aed" : "#ea580c", fontWeight: 700, textTransform: "none" }}
              >
                Clear Search
              </Button>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {stocksByStorage.map(([storageCapacity, items]) => (
                <Paper
                  key={storageCapacity}
                  elevation={0}
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  {/* Storage Group Header */}
                  <Box
                    sx={{
                      p: 2,
                      px: 2.5,
                      backgroundColor: "#f1f5f9",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box
                        sx={{
                          p: 0.6,
                          backgroundColor: condition === "Brand New" ? "#7c3aed" : "#ea580c",
                          color: "#ffffff",
                          borderRadius: 1.5,
                          display: "flex",
                        }}
                      >
                        <StorageIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {storageCapacity} Capacity
                      </Typography>
                      <Chip
                        label={`${items.length} ${items.length === 1 ? "unit" : "units"}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          backgroundColor: "#e2e8f0",
                          color: "#334155",
                        }}
                      />
                    </Box>

                    <Chip
                      label={`${items.length} ${condition}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        backgroundColor: condition === "Brand New" ? "#f5f3ff" : "#fff7ed",
                        color: condition === "Brand New" ? "#6d28d9" : "#c2410c",
                        border: `1px solid ${condition === "Brand New" ? "#ddd6fe" : "#fed7aa"}`,
                      }}
                    />
                  </Box>

                    {/* Stock items list under this storage */}
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.5}>
                        {items.map((stockItem, idx) => {
                          const isCopied = copiedImei === stockItem.imei;

                          return (
                            <Paper
                              key={stockItem.id || idx}
                              variant="outlined"
                              sx={{
                                p: 1.75,
                                px: 2,
                                borderRadius: 2,
                                borderColor: "#e2e8f0",
                                backgroundColor: "#ffffff",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#cbd5e1",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: { xs: "flex-start", sm: "center" },
                                  flexDirection: { xs: "column", sm: "row" },
                                  gap: 1.5,
                                }}
                              >
                                {/* Left Side: IMEI & Badges */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                    <Box
                                      sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        backgroundColor: "#f8fafc",
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        border: "1px solid #cbd5e1",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: "#64748b",
                                          fontSize: "0.72rem",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        IMEI:
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontFamily: "monospace",
                                          fontWeight: 800,
                                          fontSize: "0.95rem",
                                          color: "#0f172a",
                                          letterSpacing: "0.04em",
                                        }}
                                      >
                                        {stockItem.imei}
                                      </Typography>
                                      <Tooltip title={isCopied ? "Copied!" : "Copy IMEI"}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCopyImei(stockItem.imei)}
                                          sx={{
                                            p: 0.4,
                                            ml: 0.25,
                                            color: isCopied ? "#059669" : "#64748b",
                                          }}
                                        >
                                          {isCopied ? (
                                            <CheckIcon sx={{ fontSize: 16 }} />
                                          ) : (
                                            <ContentCopyIcon sx={{ fontSize: 15 }} />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                    </Box>

                                    {/* Type Pill */}
                                    <Chip
                                      label={stockItem.type}
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: "0.72rem",
                                        backgroundColor:
                                          stockItem.type === "Brand New" ? "#f5f3ff" : "#fff7ed",
                                        color:
                                          stockItem.type === "Brand New" ? "#6d28d9" : "#c2410c",
                                        border: `1px solid ${stockItem.type === "Brand New" ? "#ddd6fe" : "#fed7aa"
                                          }`,
                                      }}
                                    />

                                    {/* Battery Health Chip */}
                                    {renderBatteryChip(stockItem)}
                                  </Box>

                                  {/* Secondary Metadata (Color, Notes, Date) */}
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                    {stockItem.color && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <PaletteIcon sx={{ fontSize: 14, color: "#64748b" }} />
                                        <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>
                                          {stockItem.color}
                                        </Typography>
                                      </Box>
                                    )}
                                    {stockItem.notes && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <NotesIcon sx={{ fontSize: 14, color: "#64748b" }} />
                                        <Typography variant="caption" sx={{ color: "#475569", fontStyle: "italic" }}>
                                          "{stockItem.notes}"
                                        </Typography>
                                      </Box>
                                    )}
                                    {stockItem.createdAt && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                          {new Date(stockItem.createdAt).toLocaleDateString("en-LK", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>

                                {/* Right Side: Delete Action */}
                                {isOwner && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Tooltip title="Remove stock unit">
                                      <IconButton
                                        size="small"
                                        onClick={() => setStockToDelete(stockItem)}
                                        sx={{
                                          color: "#94a3b8",
                                          "&:hover": {
                                            color: "#ef4444",
                                            backgroundColor: "#fef2f2",
                                          },
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 19 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Paper>
                ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={onClose} sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Deleting Stock */}
      <Dialog
        open={Boolean(stockToDelete)}
        onClose={() => !isDeleting && setStockToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#dc2626" }}>
          Remove Stock Unit?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#334155", fontSize: "0.9rem" }}>
            Are you sure you want to remove IMEI:{" "}
            <strong>{stockToDelete?.imei}</strong> ({stockToDelete?.storage} - {stockToDelete?.type}) from inventory? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            onClick={() => setStockToDelete(null)}
            disabled={isDeleting}
            sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5 }}
          >
            {isDeleting ? "Removing..." : "Remove Stock"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
