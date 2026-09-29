"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import { GroupedSmartphone, SmartphoneStockItem } from "@/types/smartphone";

interface UnitEntry {
  imei: string;
  storage: string;
  customStorage: string;
  batteryHealth: string;
  color: string;
}

const makeUnit = (defaultStorage: string): UnitEntry => ({
  imei: "",
  storage: defaultStorage,
  customStorage: "",
  batteryHealth: "85",
  color: "",
});

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  smartphone: GroupedSmartphone | null;
  onAddStock: (
    smartphoneId: string,
    stock:
      | Omit<SmartphoneStockItem, "id" | "createdAt">
      | Omit<SmartphoneStockItem, "id" | "createdAt">[]
  ) => Promise<void>;
}

export default function AddStockModal({
  open,
  onClose,
  smartphone,
  onAddStock,
}: AddStockModalProps) {
  const [phoneType, setPhoneType] = useState<"Brand New" | "Used">("Brand New");
  const [unitCount, setUnitCount] = useState(1);
  const [units, setUnits] = useState<UnitEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Storage chips strictly show the capacities configured for this specific smartphone model
  const storageOptions = useMemo(() => {
    const fromVariants = (smartphone?.variants || [])
      .map((v) => v.storage?.trim())
      .filter(Boolean);
    return fromVariants.length > 0
      ? Array.from(new Set(fromVariants))
      : ["128GB", "256GB"];
  }, [smartphone]);

  const defaultStorage = storageOptions[0] || "128GB";

  useEffect(() => {
    if (!open) return;
    setPhoneType("Brand New");
    setUnitCount(1);
    setUnits([makeUnit(defaultStorage)]);
    setErrors({});
  }, [smartphone, open, defaultStorage]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const changeCount = (delta: number) => {
    const next = Math.max(1, Math.min(20, unitCount + delta));
    setUnitCount(next);
    setUnits((prev) => {
      if (next > prev.length) {
        const added = Array.from({ length: next - prev.length }, () =>
          makeUnit(defaultStorage)
        );
        return [...prev, ...added];
      }
      return prev.slice(0, next);
    });
  };

  const updateUnit = (idx: number, field: keyof UnitEntry, value: string) => {
    setUnits((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, [field]: value } : u))
    );
    const key = `${field}_${idx}`;
    if (errors[key]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartphone?.id) return;

    const newErrors: Record<string, string> = {};
    const seenImeis = new Set<string>();
    const stockItems: Omit<SmartphoneStockItem, "id" | "createdAt">[] = [];

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      const effectiveStorage =
        u.storage === "custom" ? u.customStorage.trim() : u.storage.trim();
      const cleanImei = u.imei.trim().replace(/\s+/g, "");
      const tag = units.length > 1 ? ` (Unit ${i + 1})` : "";

      if (!effectiveStorage) {
        newErrors[`storage_${i}`] = `Storage is required${tag}`;
      }

      if (!cleanImei) {
        newErrors[`imei_${i}`] = `IMEI is required${tag}`;
      } else if (cleanImei.length < 8) {
        newErrors[`imei_${i}`] = `IMEI must be at least 8 digits${tag}`;
      } else if (seenImeis.has(cleanImei.toLowerCase())) {
        newErrors[`imei_${i}`] = `Duplicate IMEI in this batch${tag}`;
      } else if (
        smartphone.stocks?.some(
          (s) => s.imei.toLowerCase() === cleanImei.toLowerCase()
        )
      ) {
        newErrors[`imei_${i}`] = `IMEI already exists in stock${tag}`;
      } else {
        seenImeis.add(cleanImei.toLowerCase());
      }

      let batteryNum: number | null = null;
      if (phoneType === "Used") {
        const bNum = Number(u.batteryHealth);
        if (!u.batteryHealth.trim()) {
          newErrors[`batteryHealth_${i}`] = `Battery health required${tag}`;
        } else if (isNaN(bNum) || bNum < 1 || bNum > 100) {
          newErrors[`batteryHealth_${i}`] = `Enter a value between 1 and 100${tag}`;
        } else {
          batteryNum = Math.round(bNum);
        }
      }

      if (!newErrors[`imei_${i}`] && !newErrors[`storage_${i}`]) {
        stockItems.push({
          storage: effectiveStorage,
          imei: cleanImei,
          type: phoneType,
          batteryHealth: phoneType === "Used" ? batteryNum : 100,
          status: "Available",
          color: u.color.trim() || undefined,
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onAddStock(
        smartphone.id,
        stockItems.length === 1 ? stockItems[0] : stockItems
      );
      setSubmitting(false);
      handleClose();
    } catch (err: any) {
      console.error("Error adding stock:", err);
      setErrors({
        submit: err?.message || "Failed to add stock. Please try again.",
      });
      setSubmitting(false);
    }
  };

  if (!smartphone) return null;

  const hasErrors = (idx: number) =>
    Object.keys(errors).some((k) => k.endsWith(`_${idx}`));

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
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 2,
              display: "flex",
            }}
          >
            <InventoryIcon sx={{ fontSize: 24, color: "#ffffff" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Add Stock Units
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}
            >
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
          dividers
          sx={{
            p: 3,
            backgroundColor: "#f8fafc",
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errors.submit}
            </Alert>
          )}

          {/* Step 1 - Phone Condition */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: 2.5,
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem", mb: 1.5 }}
            >
              Phone Condition
            </Typography>
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
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    "&:hover": { borderColor: "#7c3aed" },
                  }}
                >
                  <NewReleasesIcon
                    sx={{
                      color: phoneType === "Brand New" ? "#7c3aed" : "#94a3b8",
                      fontSize: 26,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: "#1e293b" }}>
                      Brand New
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Factory sealed
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
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    "&:hover": { borderColor: "#ea580c" },
                  }}
                >
                  <HistoryToggleOffIcon
                    sx={{
                      color: phoneType === "Used" ? "#ea580c" : "#94a3b8",
                      fontSize: 26,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: "#1e293b" }}>
                      Used / Pre-Owned
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Includes battery check
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Step 2 - Number of Units */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 2.5,
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>
                  Number of Units
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  A card will appear below for each unit
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => changeCount(-1)}
                  disabled={unitCount <= 1}
                  sx={{
                    color: unitCount <= 1 ? "#cbd5e1" : "#7c3aed",
                    "&:hover": { backgroundColor: "#f5f3ff" },
                  }}
                >
                  <RemoveCircleOutlineIcon sx={{ fontSize: 28 }} />
                </IconButton>

                <Box
                  sx={{
                    minWidth: 54,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    border: "2px solid #7c3aed",
                    backgroundColor: "#f5f3ff",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: "#7c3aed", fontSize: "1.15rem" }}>
                    {unitCount}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={() => changeCount(1)}
                  disabled={unitCount >= 20}
                  sx={{
                    color: unitCount >= 20 ? "#cbd5e1" : "#7c3aed",
                    "&:hover": { backgroundColor: "#f5f3ff" },
                  }}
                >
                  <AddCircleOutlineIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          {/* Step 3 - Per-unit cards */}
          <Stack spacing={2}>
            {units.map((unit, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  border: "1.5px solid",
                  borderColor: hasErrors(i) ? "#fca5a5" : "#e2e8f0",
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                }}
              >
                {/* Card header */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.4,
                    background: hasErrors(i)
                      ? "linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)"
                      : "linear-gradient(135deg, #f8fafc 0%, #f5f3ff 100%)",
                    borderBottom: "1px solid",
                    borderColor: hasErrors(i) ? "#fecaca" : "#ede9fe",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PhoneAndroidIcon
                    sx={{
                      fontSize: 17,
                      color: hasErrors(i) ? "#ef4444" : "#7c3aed",
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: hasErrors(i) ? "#b91c1c" : "#1e293b",
                      fontSize: "0.85rem",
                    }}
                  >
                    Unit {i + 1}
                  </Typography>
                  {hasErrors(i) && (
                    <Chip
                      label="Has errors"
                      size="small"
                      sx={{
                        ml: "auto",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        height: 20,
                      }}
                    />
                  )}
                  {!hasErrors(i) && unit.imei && (
                    <Chip
                      label={unit.imei}
                      size="small"
                      sx={{
                        ml: "auto",
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        backgroundColor: "#ede9fe",
                        color: "#6d28d9",
                        height: 20,
                      }}
                    />
                  )}
                </Box>

                {/* Card fields */}
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2}>
                    {/* IMEI */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}
                      >
                        IMEI Number *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g., 358291092837192"
                        value={unit.imei}
                        onChange={(e) => updateUnit(i, "imei", e.target.value)}
                        error={Boolean(errors[`imei_${i}`])}
                        helperText={errors[`imei_${i}`]}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <QrCodeScannerIcon sx={{ color: "#7c3aed", fontSize: 18 }} />
                              </InputAdornment>
                            ),
                            sx: { fontFamily: "monospace", letterSpacing: "0.04em" },
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                          },
                        }}
                      />
                    </Grid>

                    {/* Storage */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}
                      >
                        Storage *
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                          mb: unit.storage === "custom" ? 1 : 0,
                        }}
                      >
                        {storageOptions.map((opt) => (
                          <Chip
                            key={opt}
                            label={opt}
                            size="small"
                            clickable
                            onClick={() => updateUnit(i, "storage", opt)}
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              borderColor: unit.storage === opt ? "#7c3aed" : "#cbd5e1",
                              borderWidth: unit.storage === opt ? 2 : 1,
                              backgroundColor: unit.storage === opt ? "#f5f3ff" : "#ffffff",
                              color: unit.storage === opt ? "#7c3aed" : "#334155",
                              "&:hover": {
                                backgroundColor: unit.storage === opt ? "#ede9fe" : "#f8fafc",
                              },
                            }}
                            variant="outlined"
                          />
                        ))}
                        <Chip
                          label="Custom"
                          size="small"
                          clickable
                          onClick={() => updateUnit(i, "storage", "custom")}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            borderColor: unit.storage === "custom" ? "#7c3aed" : "#cbd5e1",
                            borderWidth: unit.storage === "custom" ? 2 : 1,
                            backgroundColor: unit.storage === "custom" ? "#f5f3ff" : "#ffffff",
                            color: unit.storage === "custom" ? "#7c3aed" : "#64748b",
                          }}
                          variant="outlined"
                        />
                      </Box>
                      {unit.storage === "custom" && (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="e.g., 64GB, 2TB"
                          value={unit.customStorage}
                          onChange={(e) => updateUnit(i, "customStorage", e.target.value)}
                          error={Boolean(errors[`storage_${i}`])}
                          helperText={errors[`storage_${i}`]}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "#f8fafc",
                            },
                          }}
                        />
                      )}
                      {unit.storage !== "custom" && errors[`storage_${i}`] && (
                        <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 600 }}>
                          {errors[`storage_${i}`]}
                        </Typography>
                      )}
                    </Grid>

                    {/* Color */}
                    <Grid size={{ xs: 12, sm: phoneType === "Used" ? 6 : 12 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}
                      >
                        Color / Finish
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g., Natural Titanium, Midnight Black"
                        value={unit.color}
                        onChange={(e) => updateUnit(i, "color", e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PaletteOutlinedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                          },
                        }}
                      />
                    </Grid>

                    {/* Battery Health - Used only */}
                    {phoneType === "Used" && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: "#ea580c", display: "block", mb: 0.5 }}
                        >
                          Battery Health % *
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="e.g., 85"
                          value={unit.batteryHealth}
                          onChange={(e) => updateUnit(i, "batteryHealth", e.target.value)}
                          error={Boolean(errors[`batteryHealth_${i}`])}
                          helperText={errors[`batteryHealth_${i}`]}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BatteryChargingFullIcon sx={{ color: "#ea580c", fontSize: 18 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">%</InputAdornment>
                              ),
                            },
                            htmlInput: { min: 1, max: 100, step: 1 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "#fff7ed",
                              "&.Mui-focused fieldset": { borderColor: "#ea580c" },
                            },
                          }}
                        />
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.75 }}>
                          {["80", "85", "88", "92", "96", "100"].map((v) => (
                            <Chip
                              key={v}
                              label={`${v}%`}
                              size="small"
                              clickable
                              onClick={() => updateUnit(i, "batteryHealth", v)}
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                backgroundColor: unit.batteryHealth === v ? "#ea580c" : "#fff7ed",
                                color: unit.batteryHealth === v ? "#ffffff" : "#ea580c",
                                border: "1px solid #ea580c",
                                "&:hover": {
                                  backgroundColor: unit.batteryHealth === v ? "#c2410c" : "#ffedd5",
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            ))}
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
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AddCircleIcon />
              )
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
            {submitting
              ? "Adding Stock..."
              : unitCount > 1
              ? `Add ${unitCount} Units`
              : "Add to Stock"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
