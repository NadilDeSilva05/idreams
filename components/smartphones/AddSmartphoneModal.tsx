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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { GroupedSmartphone, SmartphoneStorageVariant } from "@/types/smartphone";

interface AddSmartphoneModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (smartphone: GroupedSmartphone) => void;
  existingBrands: string[];
  onOpenAddBrandModal: () => void;
  editingSmartphone?: GroupedSmartphone | null;
}

export default function AddSmartphoneModal({
  open,
  onClose,
  onAdd,
  existingBrands,
  onOpenAddBrandModal,
  editingSmartphone = null,
}: AddSmartphoneModalProps) {
  const isEditing = Boolean(editingSmartphone);

  const [brand, setBrand] = useState(existingBrands[0] || "Apple");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<"flagship" | "mid-range" | "budget">("flagship");
  const [variants, setVariants] = useState<Array<{ storage: string; price: string }>>([
    { storage: "128GB", price: "" },
    { storage: "256GB", price: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load editing data into form when editing smartphone changes
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
        }))
      );
    } else {
      setBrand(existingBrands[0] || "Apple");
      setModel("");
      setCategory("flagship");
      setVariants([
        { storage: "128GB", price: "" },
        { storage: "256GB", price: "" },
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
        }))
      );
    } else {
      setBrand(existingBrands[0] || "Apple");
      setModel("");
      setCategory("flagship");
      setVariants([
        { storage: "128GB", price: "" },
        { storage: "256GB", price: "" },
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

  const sortVariants = (vars: Array<{ storage: string; price: string }>) => {
    return [...vars].sort((a, b) => getStorageWeight(a.storage) - getStorageWeight(b.storage));
  };

  const handleAddVariantRow = () => {
    setVariants([...variants, { storage: "", price: "" }]);
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
      let nextVars: Array<{ storage: string; price: string }>;
      if (emptyIndex !== -1) {
        nextVars = variants.map((v, i) => (i === emptyIndex ? { ...v, storage } : v));
      } else {
        nextVars = [...variants, { storage, price: "" }];
      }
      setVariants(sortVariants(nextVars));
    }
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: "storage" | "price", value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!brand.trim()) newErrors.brand = "Brand is required";
    if (!model.trim()) newErrors.model = "Model name is required";

    const validVariants: SmartphoneStorageVariant[] = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const pNum = Number(v.price);
      if (!v.storage.trim()) {
        newErrors[`variant_storage_${i}`] = "Storage required";
      }
      if (!v.price || isNaN(pNum) || pNum <= 0) {
        newErrors[`variant_price_${i}`] = "Valid price > 0 required";
      }
      if (v.storage.trim() && pNum > 0) {
        validVariants.push({
          storage: v.storage.trim(),
          price: pNum,
        });
      }
    }

    if (validVariants.length === 0) {
      newErrors.variants = "At least one storage variant is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      brand: brand.trim(),
      model: model.trim(),
      category,
      variants: validVariants,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
            {/* Brand Select with Add Brand quick trigger */}
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
                    }
                  }}
                >
                  {existingBrands.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
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

            {/* Model Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Smartphone Model"
                placeholder="e.g., iPhone 17 Pro Max, Galaxy S25 Ultra, Pixel 9"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  if (errors.model) setErrors({ ...errors, model: "" });
                }}
                error={Boolean(errors.model)}
                helperText={errors.model}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Grid>

            {/* Storage Variants Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1, mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Storage Capacities & Retail Pricing (LKR) *
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Click to select which capacities this model comes with (only selected ones will appear when adding stock)
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

              {/* Storage Capacities Selector Chips */}
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
                        "&:hover": {
                          backgroundColor: isSelected ? "#6d28d9" : "#ede9fe",
                        },
                      }}
                    />
                  );
                })}
              </Box>

              <Paper sx={{ p: 2, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1.5 }}>
                  Set Retail Price For Each Selected Capacity:
                </Typography>
                {variants.map((v, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-start",
                      mb: idx < variants.length - 1 ? 1.5 : 0,
                    }}
                  >
                    <TextField
                      size="small"
                      label={`Storage #${idx + 1}`}
                      placeholder="e.g. 128GB, 256GB"
                      value={v.storage}
                      onChange={(e) => handleVariantChange(idx, "storage", e.target.value)}
                      error={Boolean(errors[`variant_storage_${idx}`])}
                      sx={{ width: 140 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Retail Price (LKR)"
                      placeholder="0"
                      value={v.price}
                      onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                      error={Boolean(errors[`variant_price_${idx}`])}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                        },
                        htmlInput: { min: 0, step: 1000 },
                      }}
                    />
                    {variants.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveVariantRow(idx)}
                        sx={{ color: "#ef4444", mt: 0.5, "&:hover": { backgroundColor: "#fee2e2" } }}
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
