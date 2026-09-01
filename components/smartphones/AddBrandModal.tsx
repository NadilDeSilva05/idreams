"use client";

import { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface AddBrandModalProps {
  open: boolean;
  onClose: () => void;
  onAddBrand: (brandName: string) => void;
  existingBrands: string[];
}

export default function AddBrandModal({
  open,
  onClose,
  onAddBrand,
  existingBrands,
}: AddBrandModalProps) {
  const [brandName, setBrandName] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setBrandName("");
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = brandName.trim();
    if (!trimmed) {
      setError("Brand name is required");
      return;
    }
    if (existingBrands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      setError("This brand already exists");
      return;
    }

    onAddBrand(trimmed);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
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
          <BrandingWatermarkIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Add New Brand
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Add a new brand catalog for smartphones (e.g., OnePlus, Sony, Honor, Xiaomi, Vivo).
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Brand Name"
            placeholder="e.g., OnePlus, Nothing, Sony"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              if (error) setError("");
            }}
            error={Boolean(error)}
            helperText={error}
            autoFocus
            sx={{ backgroundColor: "#ffffff" }}
          />
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
            Add Brand
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
