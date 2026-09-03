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
  FormLabel,
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import StorageIcon from "@mui/icons-material/Storage";
import { GroupedSmartphone, SmartphoneStockItem } from "@/types/smartphone";

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  smartphone: GroupedSmartphone | null;
  onAddStock: (
    smartphoneId: string,
    stock: Omit<SmartphoneStockItem, "id" | "createdAt">
  ) => Promise<void>;
}

export default function AddStockModal({
  open,
  onClose,
  smartphone,
  onAddStock,
}: AddStockModalProps) {
  const [storage, setStorage] = useState<string>("");
  const [customStorage, setCustomStorage] = useState<string>("");
  const [imei, setImei] = useState<string>("");
  const [phoneType, setPhoneType] = useState<"Brand New" | "Used">("Brand New");
  const [batteryHealth, setBatteryHealth] = useState<string>("85");
  const [color, setColor] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize defaults when smartphone changes
  useEffect(() => {
    if (smartphone && smartphone.variants?.length > 0) {
      setStorage(smartphone.variants[0].storage);
    } else {
      setStorage("128GB");
    }
    setCustomStorage("");
    setImei("");
    setPhoneType("Brand New");
    setBatteryHealth("85");
    setColor("");
    setNotes("");
    setErrors({});
  }, [smartphone, open]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handlePresetBattery = (val: string) => {
    setBatteryHealth(val);
    if (errors.batteryHealth) {
      const nextErrors = { ...errors };
      delete nextErrors.batteryHealth;
      setErrors(nextErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartphone || !smartphone.id) return;

    const newErrors: Record<string, string> = {};
    const effectiveStorage = storage === "custom" ? customStorage.trim() : storage.trim();

    if (!effectiveStorage) {
      newErrors.storage = "Storage capacity is required";
    }

    const cleanImei = imei.trim().replace(/\s+/g, "");
    if (!cleanImei) {
      newErrors.imei = "IMEI number is required";
    } else if (cleanImei.length < 8) {
      newErrors.imei = "Please enter a valid IMEI number (minimum 8 digits)";
    } else if (
      smartphone.stocks?.some(
        (s) => s.imei.toLowerCase() === cleanImei.toLowerCase()
      )
    ) {
      newErrors.imei = "This IMEI number already exists in stock for this model";
    }

    let batteryHealthNum: number | null = null;
    if (phoneType === "Used") {
      const bNum = Number(batteryHealth);
      if (!batteryHealth.trim()) {
        newErrors.batteryHealth = "Battery health is required for used phones";
      } else if (isNaN(bNum) || bNum < 1 || bNum > 100) {
        newErrors.batteryHealth = "Battery health must be between 1% and 100%";
      } else {
        batteryHealthNum = Math.round(bNum);
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onAddStock(smartphone.id, {
        storage: effectiveStorage,
        imei: cleanImei,
        type: phoneType,
        batteryHealth: phoneType === "Used" ? batteryHealthNum : 100,
        status: "Available",
        color: color.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSubmitting(false);
      handleClose();
    } catch (err: any) {
      console.error("Error adding stock:", err);
      setErrors({ submit: err?.message || "Failed to add stock item. Please try again." });
      setSubmitting(false);
    }
  };

  if (!smartphone) return null;

  const availableStorageOptions = smartphone.variants?.map((v) => v.storage) || [
    "64GB",
    "128GB",
    "256GB",
    "512GB",
    "1TB",
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 45px rgba(124, 58, 237, 0.16)",
            maxHeight: "90vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
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
            <InventoryIcon sx={{ fontSize: 24, color: "#ffffff" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Add Stock Unit
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 600 }}>
              {smartphone.brand} {smartphone.model}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
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
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errors.submit}
            </Alert>
          )}

          {/* Device Header Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "#f5f3ff",
              border: "1px solid #ddd6fe",
              borderRadius: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 800, textTransform: "uppercase" }}>
                {smartphone.brand}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b" }}>
                {smartphone.model}
              </Typography>
            </Box>
            <Chip
              label={`${smartphone.stocks?.length || 0} In Stock`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: "#ede9fe",
                color: "#6d28d9",
              }}
            />
          </Paper>

          <Stack spacing={3}>
            {/* 1. Phone Type (Brand New or Used) */}
            <FormControl component="fieldset" fullWidth>
              <FormLabel
                sx={{
                  fontWeight: 700,
                  color: "#1e293b",
                  fontSize: "0.9rem",
                  mb: 1.2,
                  "&.Mui-focused": { color: "#7c3aed" },
                }}
              >
                Phone Condition / Type
              </FormLabel>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    variant="outlined"
                    onClick={() => setPhoneType("Brand New")}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderWidth: 2,
                      borderColor: phoneType === "Brand New" ? "#7c3aed" : "#e2e8f0",
                      backgroundColor: phoneType === "Brand New" ? "#f5f3ff" : "#ffffff",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      "&:hover": { borderColor: "#7c3aed" },
                    }}
                  >
                    <NewReleasesIcon
                      sx={{
                        color: phoneType === "Brand New" ? "#7c3aed" : "#94a3b8",
                        fontSize: 26,
                      }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#1e293b" }}>
                        Brand New
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Factory sealed / 100%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper
                    variant="outlined"
                    onClick={() => setPhoneType("Used")}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderWidth: 2,
                      borderColor: phoneType === "Used" ? "#ea580c" : "#e2e8f0",
                      backgroundColor: phoneType === "Used" ? "#fff7ed" : "#ffffff",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      "&:hover": { borderColor: "#ea580c" },
                    }}
                  >
                    <HistoryToggleOffIcon
                      sx={{
                        color: phoneType === "Used" ? "#ea580c" : "#94a3b8",
                        fontSize: 26,
                      }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#1e293b" }}>
                        Used / Pre-Owned
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Graded / Battery check
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </FormControl>

            {/* 2. Storage Capacity Selection */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.2 }}>
                <StorageIcon sx={{ color: "#7c3aed", fontSize: 18 }} />
                <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                  Storage Capacity *
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                {availableStorageOptions.map((opt) => {
                  const isSelected = storage === opt;
                  return (
                    <Chip
                      key={opt}
                      label={opt}
                      clickable
                      onClick={() => {
                        setStorage(opt);
                        if (errors.storage) {
                          const nextErrors = { ...errors };
                          delete nextErrors.storage;
                          setErrors(nextErrors);
                        }
                      }}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        px: 1.5,
                        py: 2.2,
                        borderRadius: 2,
                        borderColor: isSelected ? "#7c3aed" : "#cbd5e1",
                        borderWidth: isSelected ? 2 : 1,
                        backgroundColor: isSelected ? "#f5f3ff" : "#ffffff",
                        color: isSelected ? "#7c3aed" : "#334155",
                        "&:hover": {
                          backgroundColor: isSelected ? "#ede9fe" : "#f8fafc",
                        },
                      }}
                      variant="outlined"
                    />
                  );
                })}

                <Chip
                  label="Custom"
                  clickable
                  onClick={() => setStorage("custom")}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    px: 1.5,
                    py: 2.2,
                    borderRadius: 2,
                    borderColor: storage === "custom" ? "#7c3aed" : "#cbd5e1",
                    borderWidth: storage === "custom" ? 2 : 1,
                    backgroundColor: storage === "custom" ? "#f5f3ff" : "#ffffff",
                    color: storage === "custom" ? "#7c3aed" : "#64748b",
                  }}
                  variant="outlined"
                />
              </Box>

              {storage === "custom" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Custom Storage"
                  placeholder="e.g., 64GB, 2TB"
                  value={customStorage}
                  onChange={(e) => setCustomStorage(e.target.value)}
                  error={Boolean(errors.storage)}
                  helperText={errors.storage}
                  sx={{ mt: 1 }}
                />
              )}
              {storage !== "custom" && errors.storage && (
                <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 600 }}>
                  {errors.storage}
                </Typography>
              )}
            </Box>

            {/* 3. IMEI Number */}
            <Box>
              <TextField
                fullWidth
                size="small"
                label="IMEI Number *"
                placeholder="e.g., 358291092837192"
                value={imei}
                onChange={(e) => {
                  setImei(e.target.value);
                  if (errors.imei) {
                    const nextErrors = { ...errors };
                    delete nextErrors.imei;
                    setErrors(nextErrors);
                  }
                }}
                error={Boolean(errors.imei)}
                helperText={
                  errors.imei || "Enter the unique 15-digit IMEI number for this device."
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { fontFamily: "monospace", letterSpacing: "0.04em" },
                  },
                }}
              />
            </Box>

            {/* 4. Battery Health (%) - Conditional for Used phones */}
            {phoneType === "Used" && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#fff7ed",
                  borderRadius: 2.5,
                  border: "1px solid #fed7aa",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <BatteryChargingFullIcon sx={{ color: "#ea580c", fontSize: 22 }} />
                  <Typography sx={{ fontWeight: 800, color: "#9a3412", fontSize: "0.92rem" }}>
                    Battery Health Percentage (%) *
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "#c2410c", display: "block", mb: 1.5 }}>
                  Indicate the tested battery health capacity for this used device.
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="Battery Health"
                    value={batteryHealth}
                    onChange={(e) => {
                      setBatteryHealth(e.target.value);
                      if (errors.batteryHealth) {
                        const nextErrors = { ...errors };
                        delete nextErrors.batteryHealth;
                        setErrors(nextErrors);
                      }
                    }}
                    error={Boolean(errors.batteryHealth)}
                    helperText={errors.batteryHealth}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      },
                      htmlInput: { min: 1, max: 100, step: 1 },
                    }}
                    sx={{ width: 160, backgroundColor: "#ffffff" }}
                  />

                  {/* Quick Preset Buttons */}
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {["82", "85", "88", "92", "96", "100"].map((val) => (
                      <Chip
                        key={val}
                        label={`${val}%`}
                        size="small"
                        clickable
                        onClick={() => handlePresetBattery(val)}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          backgroundColor: batteryHealth === val ? "#ea580c" : "#ffffff",
                          color: batteryHealth === val ? "#ffffff" : "#ea580c",
                          border: "1px solid #ea580c",
                          "&:hover": {
                            backgroundColor: batteryHealth === val ? "#c2410c" : "#ffedd5",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* 5. Optional Color & Notes */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Color / Finish (Optional)"
                  placeholder="e.g., Natural Titanium, Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Condition Notes (Optional)"
                  placeholder="e.g., Mint condition, Box included"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>
          </Stack>
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
              background: "linear-gradient(135deg, #7c3aed 0%, #ea580c 100%)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 1.75,
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #6d28d9 0%, #c2410c 100%)",
              },
            }}
          >
            {submitting ? "Adding Stock..." : "Add to Stock"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
