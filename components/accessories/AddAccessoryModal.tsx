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
  Switch,
  FormControlLabel,
  InputAdornment,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import { Accessory, categoryLabels } from "@/hooks/useAccessories";

interface AddAccessoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (accessory: Omit<Accessory, "id">) => void;
  existingBrands: string[];
}

export default function AddAccessoryModal({
  open,
  onClose,
  onAdd,
  existingBrands,
}: AddAccessoryModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Accessory["category"]>("charging-docks");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = () => {
    setName("");
    setCategory("charging-docks");
    setBrand("");
    setCustomBrand("");
    setSpecifications("");
    setPrice("");
    setInStock(true);
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Accessory name is required";
    const selectedBrand = brand === "Other" ? customBrand.trim() : brand.trim();
    if (!selectedBrand) newErrors.brand = "Brand is required";
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Valid price greater than 0 is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      name: name.trim(),
      category,
      brand: selectedBrand,
      specifications: specifications.trim() || undefined,
      price: priceNum,
      inStock,
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
          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
          color: "#ffffff",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HeadphonesIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Add New Accessory
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          <Grid container spacing={2.5}>
            {/* Category */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small" sx={{ backgroundColor: "#ffffff" }}>
                <InputLabel>Accessory Category</InputLabel>
                <Select
                  value={category}
                  label="Accessory Category"
                  onChange={(e) => setCategory(e.target.value as Accessory["category"])}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Accessory Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Accessory Name"
                placeholder="e.g., MagSafe Wireless Charger, SuperD Glass"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                error={Boolean(errors.name)}
                helperText={errors.name}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Grid>

            {/* Brand Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" sx={{ backgroundColor: "#ffffff" }} error={Boolean(errors.brand)}>
                <InputLabel>Brand</InputLabel>
                <Select
                  value={brand}
                  label="Brand"
                  onChange={(e) => {
                    setBrand(e.target.value);
                    if (errors.brand) setErrors({ ...errors, brand: "" });
                  }}
                >
                  {existingBrands.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                  <MenuItem value="Other">+ Add Custom Brand</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Brand Input if "Other" */}
            {brand === "Other" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Enter Brand Name"
                  placeholder="e.g., Baseus, Ugreen"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  error={Boolean(errors.brand)}
                  helperText={errors.brand}
                  sx={{ backgroundColor: "#ffffff" }}
                />
              </Grid>
            )}

            {/* Specifications / Variant */}
            <Grid size={{ xs: 12, sm: brand === "Other" ? 12 : 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Specification / Model Fit"
                placeholder="e.g., 20W, 20000mAh, iPhone 16 Pro"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Grid>

            {/* Price */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Price in LKR"
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors({ ...errors, price: "" });
                }}
                error={Boolean(errors.price)}
                helperText={errors.price}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  },
                  htmlInput: { min: 0, step: 50 },
                }}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Grid>

            {/* Stock Switch */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", pl: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: inStock ? "#10b981" : "#64748b" }}>
                      {inStock ? "Available in Stock" : "Out of Stock"}
                    </Typography>
                  }
                />
              </Box>
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
              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
            }}
          >
            Add Accessory
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
