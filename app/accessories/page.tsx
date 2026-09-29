"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CircularProgress from "@mui/material/CircularProgress";
import { useAccessories, Accessory, AccessoryStockItem, categoryLabels } from "@/hooks/useAccessories";
import { useCart } from "@/context/cart-context";
import { PersistentCart, CartButton } from "@/components/cart/persistent-cart";
import AddAccessoryModal from "@/components/accessories/AddAccessoryModal";
import AccessoryStockModal from "@/components/accessories/AccessoryStockModal";
import { useAuth } from "@/context/auth-context";

type CategoryType = keyof typeof categoryLabels | "all";

type AccessorySelection = {
  brand: string;
  name: string;
  specifications: string;
  price: number;
};

export default function AccessoriesPage() {
  const { addToCart } = useCart();
  const { isOwner } = useAuth();
  const {
    accessories,
    loading,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    addAccessoryStock,
    deleteAccessoryStock,
    getTotalStock,
  } = useAccessories();

  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [selectedAccessory, setSelectedAccessory] = useState<AccessorySelection | null>(null);
  const [enteredPrice, setEnteredPrice] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stock modal
  const [stockModalAccessory, setStockModalAccessory] = useState<Accessory | null>(null);

  // Edit/delete for owners
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [deleteConfirmAccessory, setDeleteConfirmAccessory] = useState<Accessory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "name-asc">("default");

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const showToast = (message: string, severity: "success" | "error" | "info" | "warning" = "success") =>
    setToast({ open: true, message, severity });

  const categories: (keyof typeof categoryLabels)[] = [
    "charging-docks",
    "power-banks",
    "car-chargers",
    "camera-lens",
    "back-covers",
    "tempered-glass",
    "cables",
  ];

  // Derive unique brands from existing + newly added accessories
  const uniqueBrands = Array.from(new Set(accessories.map((p) => p.brand))).filter(Boolean);

  // Filtering Logic
  const filteredProducts = accessories
    .filter((product) => {
      const categoryMatch = activeCategory === "all" || product.category === activeCategory;
      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        (product.specifications && product.specifications.toLowerCase().includes(searchLower));
      const brandMatch = selectedBrand === "all" || product.brand === selectedBrand;
      const stockMatch =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && product.inStock) ||
        (stockFilter === "out-of-stock" && !product.inStock);
      return categoryMatch && searchMatch && brandMatch && stockMatch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

  const handleOpenPriceDialog = (product: Accessory) => {
    setSelectedAccessory({
      brand: product.brand,
      name: product.name,
      specifications: product.specifications || "Standard",
      price: product.price,
    });
    setEnteredPrice(String(product.price));
  };

  const handleAddToCart = () => {
    if (!selectedAccessory) return;
    const priceValue = Number(enteredPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return;
    addToCart({
      brand: selectedAccessory.brand,
      model: selectedAccessory.name,
      storage: selectedAccessory.specifications,
      price: priceValue,
    });
    setSelectedAccessory(null);
    setEnteredPrice("");
  };

  const handleAddAccessory = async (newAccessoryData: Omit<Accessory, "id">) => {
    if (!isOwner) return;
    await addAccessory(newAccessoryData);
    if (activeCategory !== "all" && activeCategory !== newAccessoryData.category) {
      setActiveCategory(newAccessoryData.category);
    }
    showToast("Accessory added successfully!");
  };

  const handleDeleteAccessory = async () => {
    if (!deleteConfirmAccessory?.id || !isOwner) return;
    try {
      setIsDeleting(true);
      await deleteAccessory(deleteConfirmAccessory.id);
      setDeleteConfirmAccessory(null);
      showToast("Accessory deleted.");
    } catch {
      showToast("Failed to delete accessory.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddStock = async (
    accessoryId: string,
    stockData:
      | Omit<AccessoryStockItem, "id" | "createdAt">
      | Omit<AccessoryStockItem, "id" | "createdAt">[]
  ) => {
    if (!isOwner) return;
    await addAccessoryStock(accessoryId, stockData);
    const count = Array.isArray(stockData) ? stockData.length : 1;
    showToast(count > 1 ? `${count} stock entries added!` : "Stock entry added!");
  };

  const handleDeleteStock = async (accessoryId: string, stockId: string) => {
    if (!isOwner) return;
    await deleteAccessoryStock(accessoryId, stockId);
    showToast("Stock entry removed.");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedBrand("all");
    setStockFilter("all");
    setSortBy("default");
    setActiveCategory("all");
  };

  const isFiltersActive =
    searchTerm !== "" ||
    selectedBrand !== "all" ||
    stockFilter !== "all" ||
    sortBy !== "default" ||
    activeCategory !== "all";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ height: 32, display: "flex", alignItems: "center" }}>
                <img
                  src="/Images/i Dreams.png"
                  alt="iDreams Logo"
                  style={{ height: "100%", objectFit: "contain" }}
                />
              </Box>
              <Divider orientation="vertical" flexItem sx={{ height: 18, my: "auto" }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: 800, color: "#7c3aed", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <HeadphonesIcon sx={{ color: "#7c3aed", fontSize: 22 }} />
                Accessories Store
              </Typography>
              {!isOwner && (
                <Chip
                  icon={<BlockIcon sx={{ fontSize: "14px !important" }} />}
                  label="View & Cart Only"
                  size="small"
                  sx={{
                    backgroundColor: "#fff7ed",
                    color: "#ea580c",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    border: "1px solid #fed7aa",
                  }}
                />
              )}
            </Box>
            <CartButton />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Category Tabs */}
          <Paper
            sx={{
              mb: 3,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={activeCategory}
              onChange={(_, newValue) => setActiveCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#7c3aed",
                  height: 3.5,
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#64748b",
                  py: 1.5,
                },
                "& .Mui-selected": {
                  color: "#7c3aed",
                  fontWeight: 700,
                },
              }}
            >
              <Tab label={`All Categories (${accessories.length})`} value="all" />
              {categories.map((category) => {
                const count = accessories.filter((a) => a.category === category).length;
                return (
                  <Tab
                    key={category}
                    label={`${categoryLabels[category]} (${count})`}
                    value={category}
                  />
                );
              })}
            </Tabs>
          </Paper>

          {/* Filter Section */}
          <Paper
            sx={{
              p: 2.5,
              mb: 4,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterAltIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Filter & Search Accessories
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                {isFiltersActive && (
                  <Button
                    size="small"
                    startIcon={<RestartAltIcon />}
                    onClick={handleResetFilters}
                    sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                  >
                    Reset Filters
                  </Button>
                )}
                {/* Only owners can add accessories */}
                {isOwner && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddModalOpen(true)}
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2.2,
                      py: 0.8,
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
                      "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                    }}
                  >
                    Add Accessory
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Name, Brand or Spec"
                  placeholder="e.g., Apple 20W, Power Bank, iPhone 16 Glass"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={selectedBrand}
                    label="Brand"
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <MenuItem value="all">All Brands ({uniqueBrands.length})</MenuItem>
                    {uniqueBrands.map((b) => (
                      <MenuItem key={b} value={b}>
                        {b}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={stockFilter}
                    label="Availability"
                    onChange={(e) => setStockFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">All Items</MenuItem>
                    <MenuItem value="in-stock">In Stock Only</MenuItem>
                    <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value="default">Default Ordering</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="name-asc">Alphabetical (A - Z)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Products Grid Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
                {activeCategory === "all" ? "All Accessories" : categoryLabels[activeCategory]}
              </Typography>
              <Chip
                label={`${filteredProducts.length} items found`}
                sx={{
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(234, 88, 12, 0.1))",
                  border: "1px solid #ddd6fe",
                  color: "#7c3aed",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>

          {/* Loading Spinner */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#7c3aed" }} />
            </Box>
          )}

          {/* Products Grid */}
          {!loading && (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => {
                const productStockTotal = getTotalStock(product.id!);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.25s ease",
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 12px 24px rgba(124, 58, 237, 0.12)",
                          borderColor: "#7c3aed",
                        },
                      }}
                    >
                      <CardContent sx={{ flex: 1, p: 2.5, pb: 1.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                          <Chip
                            label={categoryLabels[product.category] || product.category}
                            size="small"
                            sx={{
                              backgroundColor: "#f5f3ff",
                              color: "#7c3aed",
                              fontWeight: 700,
                              fontSize: "0.68rem",
                              border: "1px solid #ddd6fe",
                            }}
                          />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {product.inStock ? (
                              <>
                                <CheckCircleIcon sx={{ fontSize: 14, color: "#10b981" }} />
                                <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700, fontSize: "0.7rem" }}>
                                  In Stock
                                </Typography>
                              </>
                            ) : (
                              <>
                                <CancelIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                                <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, fontSize: "0.7rem" }}>
                                  Out of Stock
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "#64748b",
                            letterSpacing: "0.05em",
                            display: "block",
                          }}
                        >
                          {product.brand}
                        </Typography>

                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", mb: 1, minHeight: 48 }}>
                          {product.name}
                        </Typography>

                        {product.specifications && (
                          <Chip
                            label={product.specifications}
                            size="small"
                            variant="outlined"
                            sx={{
                              mb: 2,
                              borderColor: "#cbd5e1",
                              color: "#475569",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                            }}
                          />
                        )}

                        {/* Stock count badge */}
                        {productStockTotal > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            <InventoryIcon sx={{ fontSize: 13, color: "#ea580c" }} />
                            <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 700, fontSize: "0.7rem" }}>
                              {productStockTotal} units in stock
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mt: "auto", pt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                            Retail Price
                          </Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#7c3aed" }}>
                            Rs. {product.price.toLocaleString("en-LK")}
                          </Typography>
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", gap: 1 }}>
                        {/* Add to Cart */}
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddShoppingCartIcon sx={{ fontSize: "1.05rem" }} />}
                          onClick={() => handleOpenPriceDialog(product)}
                          disabled={!product.inStock}
                          sx={{
                            background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                            fontWeight: 700,
                            py: 0.9,
                            fontSize: "0.85rem",
                            textTransform: "none",
                            borderRadius: 1.5,
                            boxShadow: "0 3px 8px rgba(124, 58, 237, 0.2)",
                            "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                          }}
                        >
                          {product.inStock ? "Add to Cart" : "Unavailable"}
                        </Button>

                        {/* Owner-only actions row */}
                        {isOwner && (
                          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                            {/* View/Add Stock */}
                            <Tooltip title="Manage Stock">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<WarehouseIcon sx={{ fontSize: 15 }} />}
                                onClick={() => setStockModalAccessory(product)}
                                sx={{
                                  flex: 1,
                                  textTransform: "none",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  color: "#ea580c",
                                  borderColor: "#ea580c",
                                  borderRadius: 1.5,
                                  py: 0.5,
                                  "&:hover": { borderColor: "#c2410c", backgroundColor: "#fff7ed" },
                                }}
                              >
                                Stock ({(product.stocks?.length || 0)})
                              </Button>
                            </Tooltip>

                            {/* Delete */}
                            <Tooltip title="Delete accessory">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteConfirmAccessory(product)}
                                sx={{
                                  color: "#ef4444",
                                  border: "1px solid #fecaca",
                                  borderRadius: 1.5,
                                  px: 1,
                                  "&:hover": { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#ffffff",
                borderRadius: 3,
                mt: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                No accessories found
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 3, maxWidth: 400, mx: "auto", fontSize: "0.9rem" }}>
                We couldn&apos;t find any items matching your active filter criteria. Try resetting filters
                {isOwner ? " or adding a new accessory." : "."}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={handleResetFilters} startIcon={<RestartAltIcon />}>
                  Clear Filters
                </Button>
                {isOwner && (
                  <Button
                    variant="contained"
                    onClick={() => setIsAddModalOpen(true)}
                    startIcon={<AddIcon />}
                    sx={{ background: "linear-gradient(135deg, #7c3aed, #ea580c)" }}
                  >
                    Add New Accessory
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Container>
      </Box>

      {/* Selling Price / Add to Cart Dialog */}
      <Dialog open={Boolean(selectedAccessory)} onClose={() => setSelectedAccessory(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#7c3aed", borderBottom: "1px solid #e2e8f0" }}>
          Confirm Selling Price in LKR
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ p: 2, backgroundColor: "#f5f3ff", borderRadius: 2, mb: 3, border: "1px solid #ddd6fe" }}>
            <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>
              {selectedAccessory?.brand}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {selectedAccessory?.name}
            </Typography>
            {selectedAccessory?.specifications && (
              <Chip
                label={selectedAccessory.specifications}
                size="small"
                sx={{ mt: 0.5, backgroundColor: "#ffffff", color: "#7c3aed", fontWeight: 600, fontSize: "0.75rem" }}
              />
            )}
          </Box>
          <TextField
            fullWidth
            type="number"
            label="Selling Price (LKR)"
            value={enteredPrice}
            onChange={(event) => setEnteredPrice(event.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              },
              htmlInput: { min: 0, step: 50 },
            }}
            helperText="Enter the negotiated or custom selling price for this cart item."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setSelectedAccessory(null)} sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
            }}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog — owners only */}
      <Dialog open={Boolean(deleteConfirmAccessory)} onClose={() => setDeleteConfirmAccessory(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#ef4444" }}>Delete Accessory</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>
              {deleteConfirmAccessory?.brand} {deleteConfirmAccessory?.name}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirmAccessory(null)} sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteAccessory}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
            sx={{
              backgroundColor: "#ef4444",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Accessory Modal — owners only */}
      {isOwner && (
        <AddAccessoryModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddAccessory}
          existingBrands={uniqueBrands}
        />
      )}

      {/* Stock Modal */}
      <AccessoryStockModal
        open={Boolean(stockModalAccessory)}
        onClose={() => setStockModalAccessory(null)}
        accessory={stockModalAccessory}
        onAddStock={handleAddStock}
        onDeleteStock={handleDeleteStock}
        isOwner={isOwner}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} sx={{ fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>

      <PersistentCart />
    </Box>
  );
}