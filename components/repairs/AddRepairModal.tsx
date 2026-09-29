"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  Autocomplete,
  Typography,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import PersonIcon from "@mui/icons-material/Person";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Repair } from "@/types/repair";
import { phoneModels } from "@/data/phoneData";

interface AddRepairModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (repair: Omit<Repair, "id" | "dateCreated">) => void;
  initialData?: Repair | null;
}

export default function AddRepairModal({ open, onClose, onSubmit, initialData }: AddRepairModalProps) {
  const [deviceType, setDeviceType] = useState<"smartphone" | "laptop">("smartphone");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [repairType, setRepairType] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");

  const availableModels = phoneModels.filter((p) => !brand || p.brand === brand);
  const selectedPhoneModel = phoneModels.find((p) => p.model === model);
  const availableStorage = selectedPhoneModel?.storage || [];

  useEffect(() => {
    if (initialData) {
      setDeviceType(initialData.deviceType);
      setBrand(initialData.brand || "");
      setModel(initialData.model);
      setStorage(initialData.storage || "");
      setRepairType(initialData.repairType);
      setPrice(initialData.price.toString());
      setStatus(initialData.status);
      setCustomerName(initialData.customerName || "");
      setCustomerWhatsapp(initialData.customerWhatsapp || initialData.customerPhone || "");
    } else {
      resetForm();
    }
  }, [open, initialData]);

  const resetForm = () => {
    setDeviceType("smartphone");
    setBrand("");
    setModel("");
    setStorage("");
    setRepairType("");
    setPrice("");
    setStatus("pending");
    setCustomerName("");
    setCustomerWhatsapp("");
  };

  const handleSubmit = () => {
    if (!model || !repairType || !price) {
      alert("Please fill in all required fields");
      return;
    }

    if (deviceType === "smartphone" && !brand) {
      alert("Please select a phone brand");
      return;
    }

    const repairData: Omit<Repair, "id" | "dateCreated"> = {
      deviceType,
      brand: deviceType === "smartphone" ? brand : undefined,
      model,
      storage: deviceType === "smartphone" ? storage : undefined,
      repairType,
      price: parseFloat(price),
      status,
      customerName: customerName.trim() || undefined,
      customerWhatsapp: customerWhatsapp.trim() || undefined,
      customerPhone: customerWhatsapp.trim() || undefined,
    };

    onSubmit(repairData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const uniqueBrands = Array.from(new Set(phoneModels.map((p) => p.brand)));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e293b", display: "flex", alignItems: "center", gap: 1 }}>
        {initialData ? <EditIcon sx={{ color: "#7c3aed" }} /> : <AddCircleIcon sx={{ color: "#7c3aed" }} />}
        {initialData ? "Edit Repair Ticket" : "Add New Repair Ticket"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Device Type Selection */}
          <FormControl fullWidth>
            <InputLabel>Device Type</InputLabel>
            <Select value={deviceType} label="Device Type" onChange={(e) => setDeviceType(e.target.value as any)}>
              <MenuItem value="smartphone">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SmartphoneIcon sx={{ fontSize: 18, color: "#7c3aed" }} /> Smartphone
                </Box>
              </MenuItem>
              <MenuItem value="laptop">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LaptopMacIcon sx={{ fontSize: 18, color: "#7c3aed" }} /> Laptop
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Smartphone-specific fields */}
          {deviceType === "smartphone" && (
            <>
              <FormControl fullWidth>
                <InputLabel>Phone Brand</InputLabel>
                <Select value={brand} label="Phone Brand" onChange={(e) => setBrand(e.target.value)}>
                  {uniqueBrands.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                options={availableModels.map((p) => p.model)}
                value={model}
                onChange={(_, value) => setModel(value || "")}
                renderInput={(params) => <TextField {...params} label="Phone Model" />}
                disabled={!brand}
              />

              <FormControl fullWidth disabled={!selectedPhoneModel}>
                <InputLabel>Storage Capacity</InputLabel>
                <Select value={storage} label="Storage Capacity" onChange={(e) => setStorage(e.target.value)}>
                  {availableStorage.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {/* Laptop-specific fields */}
          {deviceType === "laptop" && (
            <TextField
              label="Laptop Model"
              fullWidth
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., Dell XPS 13, MacBook Pro"
            />
          )}

          {/* Customer Details */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                mb: 1.5,
              }}
            >
              Customer Details (For WhatsApp Alerts)
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                label="Customer Name"
                fullWidth
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Kasun Perera"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ backgroundColor: "#ffffff" }}
              />

              <TextField
                label="Customer WhatsApp Number"
                fullWidth
                size="small"
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                placeholder="e.g., 0771234567 or +94771234567"
                helperText="A pickup alert can be sent to this WhatsApp number when the repair is completed."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <WhatsAppIcon sx={{ color: "#25D366", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ backgroundColor: "#ffffff" }}
              />
            </Stack>
          </Box>

          {/* Common fields */}
          <TextField
            label="Repair Type"
            fullWidth
            value={repairType}
            onChange={(e) => setRepairType(e.target.value)}
            placeholder={deviceType === "smartphone" ? "e.g., Screen Replacement, Battery" : "e.g., Hard Drive Repair, Motherboard"}
          />

          <TextField
            label="Price (LKR)"
            fullWidth
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            slotProps={{ htmlInput: { step: "1", min: "0" } }}
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as any)}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #7c3aed, #ea580c)",
            fontWeight: 700,
            "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
          }}
        >
          {initialData ? "Update" : "Create"} Repair
        </Button>
      </DialogActions>
    </Dialog>
  );
}
