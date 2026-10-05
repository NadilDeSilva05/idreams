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
  Divider,
  Paper,
  Chip,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import { GroupedSmartphone, SmartphoneStorageVariant } from "@/types/smartphone";
import { phoneModels } from "@/data/phoneData";

interface AddSmartphoneModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (smartphone: GroupedSmartphone) => void | Promise<void>;
  existingBrands: string[];
  onOpenAddBrandModal: () => void;
  editingSmartphone?: GroupedSmartphone | null;
  defaultCondition?: "Brand New" | "Used";
}

export default function AddSmartphoneModal({
  open,
  onClose,
  onAdd,
  existingBrands,
  onOpenAddBrandModal,
  editingSmartphone = null,
  defaultCondition,
}: AddSmartphoneModalProps) {
  const isEditing = Boolean(editingSmartphone);
  const contextCondition = isEditing ? undefined : defaultCondition;

  const [brand, setBrand] = useState(existingBrands[0] || "Apple");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<"flagship" | "mid-range" | "budget">("flagship");
  const [variants, setVariants] = useState<Array<{ storage: string; price: string; costPrice: string; lastSellingPrice: string }>>([
    { storage: "128GB", price: "", costPrice: "", lastSellingPrice: "" },
    { storage: "256GB", price: "", costPrice: "", lastSellingPrice: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Models for the selected brand from phoneData
  const brandModels = phoneModels
    .filter((p) => p.brand === brand || (brand.includes("Google") && p.brand.includes("Google")))
    .map((p) => p.model);

  // Auto-fill storage when a known model is chosen
  const handleModelSelect = (selectedModel: string | null) => {
    setModel(selectedModel || "");
    if (errors.model) setErrors({ ...errors, model: "" });
    const known = phoneModels.find(
      (p) =>
        (p.brand === brand || (brand.includes("Google") && p.brand.includes("Google"))) &&
        p.model === selectedModel
    );
    if (known && !isEditing) {
      setVariants(known.storage.map((s) => ({ storage: s, price: "", costPrice: "", lastSellingPrice: "" })));
    }
  };

  useEffect(() => {
    if (!open) return;
    if (editingSmartphone) {
      setBrand(editingSmartphone.brand);
      setModel(editingSmartphone.model);
      setCategory(editingSmartphone.category || "flagship");
      setVariants(
        editingSmartphone.variants.map((v) => ({
          storage: v.storage,
          price: String(v.price),
          costPrice: v.costPrice != null ? String(v.costPrice) : "",
          lastSellingPrice: v.lastSellingPrice != null ? String(v.lastSellingPrice) : "",
        }))
      );
    } else {
      setBrand(existingBrands[0] || "Apple");
      setModel("");
      setCategory("flagship");
      setVariants([
        { storage: "128GB", price: "", costPrice: "", lastSellingPrice: "" },
        { storage: "256GB", price: "", costPrice: "", lastSellingPrice: "" },
      ]);
    }
    setErrors({});
  }, [editingSmartphone, open]);

  const handleReset = () => {
    if (isEditing && editingSmartphone) {
      setBrand(editingSmartphone.brand);
      setModel(editingSmartphone.model);
      setCategory(editingSmartphone.category || "flagship");
      setVariants(
        editingSmartphone.variants.map((v) => ({
          storage: v.storage,
          price: String(v.price),
          costPrice: v.costPrice != null ? String(v.costPrice) : "",
          lastSellingPrice: v.lastSellingPrice != null ? String(v.lastSellingPrice) : "",
        }))
      );
    } else {
      setBrand(existingBrands[0] || "Apple");
      setModel("");
      setCategory("flagship");
      setVariants([
        { storage: "128GB", price: "", costPrice: "", lastSellingPrice: "" },
        { storage: "256GB", price: "", costPrice: "", lastSellingPrice: "" },
      ]);
    }
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const STORAGE_PRESETS = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

  const getStorageWeight = (s: string) => {
    const match = s.match(/(\d+)\s*(GB|TB)/i);
    if (!match) return 9999;
    const num = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();
    return unit === "TB" ? num * 1024 : num;
  };

  const sortVariants = (vars: typeof variants) =>
    [...vars].sort((a, b) => getStorageWeight(a.storage) - getStorageWeight(b.storage));

  const handleAddVariantRow = () => {
    setVariants([...variants, { storage: "", price: "", costPrice: "", lastSellingPrice: "" }]);
  };

  const handleToggleStorage = (storage: string) => {
    const existingIndex = variants.findIndex(
      (v) => v.storage.trim().toLowerCase() === storage.toLowerCase()
    );
    if (existingIndex !== -1) {
      if (variants.length > 1) {
        setVariants(variants.filter((_, idx) => idx !== existingIndex));
      }
    } else {
      const emptyIndex = variants.findIndex((v) => !v.storage.trim());
      let nextVars: typeof variants;
      if (emptyIndex !== -1) {
        nextVars = variants.map((v, i) => (i === emptyIndex ? { ...v, storage } : v));
      } else {
        nextVars = [...variants, { storage, price: "", costPrice: "", lastSellingPrice: "" }];
      }
      setVariants(sortVariants(nextVars));
    }
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: "storage" | "price" | "costPrice" | "lastSellingPrice",
    value: string
  ) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!brand.trim()) newErrors.brand = "Brand is required";
    if (!model.trim()) newErrors.model = "Model name is required";

    const validVariants: SmartphoneStorageVariant[] = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const retailNum = Number(v.price);
      const costNum = Number(v.costPrice);
      const lastSellNum = v.lastSellingPrice ? Number(v.lastSellingPrice) : NaN;
      if (!v.storage.trim()) newErrors[`variant_storage_${i}`] = "Storage required";
      if (!v.price || isNaN(retailNum) || retailNum <= 0)
        newErrors[`variant_price_${i}`] = "Valid retail price > 0 required";
      if (!v.costPrice || isNaN(costNum) || costNum <= 0)
        newErrors[`variant_costPrice_${i}`] = "Valid cost price > 0 required";
      if (v.lastSellingPrice && (isNaN(lastSellNum) || lastSellNum <= 0))
        newErrors[`variant_lastSellingPrice_${i}`] = "Enter a valid last selling price or leave blank";
      if (
        v.storage.trim() &&
        retailNum > 0 &&
        costNum > 0 &&
        (!v.lastSellingPrice || (lastSellNum > 0))
      ) {
        const sv: SmartphoneStorageVariant = {
          storage: v.storage.trim(),
          price: retailNum,
          costPrice: costNum,
        };
        if (lastSellNum > 0) sv.lastSellingPrice = lastSellNum;
        validVariants.push(sv);
      }
    }

    if (validVariants.length === 0) newErrors.variants = "At least one storage variant is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    await onAdd({ brand: brand.trim(), model: model.trim(), category, variants: validVariants });
    handleClose();
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
            maxWidth: { xs: "calc(100vw - 32px)", md: 760 },
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isEditing
            ? "linear-gradient(135deg, #7c3aed, #6366f1)"
            : "linear-gradient(135deg, #7c3aed, #9333ea)",
          color: "#ffffff",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SmartphoneIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isEditing ? "Edit Smartphone" : "Add New Smartphone"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
         
          <Grid container spacing={2.5}>
            {/* Brand */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small" sx={{ backgroundColor: "#ffffff" }}>
                <InputLabel>Brand</InputLabel>
                <Select
                  value={brand}
                  label="Brand"
                  onChange={(e) => {
                    if (e.target.value === "__new_brand__") {
                      onOpenAddBrandModal();
                    } else {
                      setBrand(e.target.value);
                      setModel("");
                    }
                  }}
                >
                  {existingBrands.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                  {!isEditing && <Divider key="brand-divider" sx={{ my: 0.5 }} />}
                  {!isEditing && (
                    <MenuItem key="brand-new" value="__new_brand__" sx={{ color: "#7c3aed", fontWeight: 700 }}>
                      + Add New Brand Catalog
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Model — Autocomplete for known brands, free text otherwise */}
            <Grid size={{ xs: 12 }}>
              {brandModels.length > 0 ? (
                <Autocomplete
                  options={brandModels}
                  value={model || null}
                  onChange={(_, value) => handleModelSelect(value)}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Smartphone Model"
                      placeholder="Search or type model name…"
                      error={Boolean(errors.model)}
                      helperText={errors.model}
                      sx={{ backgroundColor: "#ffffff" }}
                      onChange={(e) => {
                        setModel(e.target.value);
                        if (errors.model) setErrors({ ...errors, model: "" });
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label="Smartphone Model"
                  placeholder="e.g., Galaxy S25 Ultra"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    if (errors.model) setErrors({ ...errors, model: "" });
                  }}
                  error={Boolean(errors.model)}
                  helperText={errors.model}
                  sx={{ backgroundColor: "#ffffff" }}
                />
              )}
            </Grid>

            {/* Storage Variants */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1, mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Storage Capacities & Pricing (LKR) *
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Set both cost price and retail price for each capacity
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddVariantRow}
                  sx={{ textTransform: "none", fontWeight: 700, color: "#7c3aed", whiteSpace: "nowrap" }}
                >
                  Custom Capacity
                </Button>
              </Box>

              {/* Storage chip selector */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  mb: 2,
                  p: 1.5,
                  backgroundColor: "#f8fafc",
                  borderRadius: 2,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, mr: 0.5 }}>
                  Capacities:
                </Typography>
                {STORAGE_PRESETS.map((st) => {
                  const isSelected = variants.some(
                    (v) => v.storage.trim().toLowerCase() === st.toLowerCase()
                  );
                  return (
                    <Chip
                      key={st}
                      label={st}
                      clickable
                      onClick={() => handleToggleStorage(st)}
                      variant={isSelected ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        borderColor: isSelected ? "#7c3aed" : "#cbd5e1",
                        borderWidth: isSelected ? 2 : 1,
                        backgroundColor: isSelected ? "#7c3aed" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#475569",
                        boxShadow: isSelected ? "0 2px 6px rgba(124, 58, 237, 0.25)" : "none",
                        "&:hover": { backgroundColor: isSelected ? "#6d28d9" : "#ede9fe" },
                      }}
                    />
                  );
                })}
              </Box>

              <Paper sx={{ p: 2.5, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                {/* Column headers */}
                <Grid container spacing={1.5} sx={{ mb: 1.25, px: 0.5 }}>
                  <Grid size={{ xs: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569" }}>Storage</Typography>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#ea580c" }}>Cost Price *</Typography>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#7c3aed" }}>Retail Price *</Typography>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#0f766e" }}>Last Selling Price</Typography>
                  </Grid>
                  <Grid size={{ xs: 1 }} />
                </Grid>

                {variants.map((v, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: 1.25,
                      alignItems: "flex-start",
                      mb: idx < variants.length - 1 ? 1.75 : 0,
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="128GB"
                      value={v.storage}
                      onChange={(e) => handleVariantChange(idx, "storage", e.target.value)}
                      error={Boolean(errors[`variant_storage_${idx}`])}
                      helperText={errors[`variant_storage_${idx}`]}
                      sx={{ width: 110, flexShrink: 0, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Purchase cost"
                      value={v.costPrice}
                      onChange={(e) => handleVariantChange(idx, "costPrice", e.target.value)}
                      error={Boolean(errors[`variant_costPrice_${idx}`])}
                      helperText={errors[`variant_costPrice_${idx}`]}
                      slotProps={{
                        input: { startAdornment: <InputAdornment position="start">Rs.</InputAdornment> },
                        htmlInput: { min: 0, step: 1000 },
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": { borderColor: "#ea580c" },
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Retail selling"
                      value={v.price}
                      onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                      error={Boolean(errors[`variant_price_${idx}`])}
                      helperText={errors[`variant_price_${idx}`]}
                      slotProps={{
                        input: { startAdornment: <InputAdornment position="start">Rs.</InputAdornment> },
                        htmlInput: { min: 0, step: 1000 },
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Last sale (floor)"
                      value={v.lastSellingPrice}
                      onChange={(e) => handleVariantChange(idx, "lastSellingPrice", e.target.value)}
                      error={Boolean(errors[`variant_lastSellingPrice_${idx}`])}
                      slotProps={{
                        input: { startAdornment: <InputAdornment position="start">Rs.</InputAdornment> },
                        htmlInput: { min: 0, step: 1000 },
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&.Mui-focused fieldset": { borderColor: "#0f766e" },
                        },
                      }}
                    />
                    {variants.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveVariantRow(idx)}
                        sx={{ color: "#ef4444", mt: 0.5, "&:hover": { backgroundColor: "#fee2e2" }, flexShrink: 0 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={handleClose} sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isEditing ? <EditIcon /> : <AddCircleIcon />}
            sx={{
              background: isEditing
                ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                : "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": {
                background: isEditing
                  ? "linear-gradient(135deg, #6d28d9, #4f46e5)"
                  : "linear-gradient(135deg, #6d28d9, #c2410c)",
              },
            }}
          >
            {isEditing ? "Save Changes" : "Add Smartphone"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
