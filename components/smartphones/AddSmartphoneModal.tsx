"use client";

import { useState } from "react";
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
import { GroupedSmartphone, SmartphoneStorageVariant } from "@/types/smartphone";

interface AddSmartphoneModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (smartphone: GroupedSmartphone) => void;
  existingBrands: string[];
  onOpenAddBrandModal: () => void;
}

export default function AddSmartphoneModal({
  open,
  onClose,
  onAdd,
  existingBrands,
  onOpenAddBrandModal,
}: AddSmartphoneModalProps) {
  const [brand, setBrand] = useState(existingBrands[0] || "Apple");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<"flagship" | "mid-range" | "budget">("flagship");
  const [variants, setVariants] = useState<Array<{ storage: string; price: string }>>([
    { storage: "128GB", price: "220000" },
    { storage: "256GB", price: "260000" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = () => {
    setBrand(existingBrands[0] || "Apple");
    setModel("");
    setCategory("flagship");
    setVariants([
      { storage: "128GB", price: "220000" },
      { storage: "256GB", price: "260000" },
    ]);
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddVariantRow = () => {
    setVariants([...variants, { storage: "512GB", price: "" }]);
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
          backgroundColor: "#1e40af",
          color: "#ffffff",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SmartphoneIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Add New Smartphone
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem value="__new_brand__" sx={{ color: "#1e40af", fontWeight: 700 }}>
                    + Add New Brand Catalog
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Category Tier */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" sx={{ backgroundColor: "#ffffff" }}>
                <InputLabel>Market Category</InputLabel>
                <Select
                  value={category}
                  label="Market Category"
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <MenuItem value="flagship">Flagship Premium</MenuItem>
                  <MenuItem value="mid-range">Mid-Range</MenuItem>
                  <MenuItem value="budget">Budget / Entry</MenuItem>
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
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Storage Variants & Pricing (LKR)
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddVariantRow}
                  sx={{ textTransform: "none", fontWeight: 700, color: "#1e40af" }}
                >
                  Add Variant Row
                </Button>
              </Box>

              <Paper sx={{ p: 2, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 2 }}>
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
                      placeholder="e.g. 240000"
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
            startIcon={<AddCircleIcon />}
            sx={{
              background: "linear-gradient(135deg, #1e40af, #3b82f6)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": { background: "linear-gradient(135deg, #1e3a8a, #2563eb)" },
            }}
          >
            Add Smartphone
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
