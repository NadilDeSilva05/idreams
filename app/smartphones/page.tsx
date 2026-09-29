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
  TextField,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Divider,
  InputAdornment,
  Select,
  InputLabel,
  MenuItem,
  Snackbar,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import StorageIcon from "@mui/icons-material/Storage";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PaletteIcon from "@mui/icons-material/Palette";
import CloseIcon from "@mui/icons-material/Close";
import { useSmartphones, GroupedSmartphone, SmartphoneStockItem } from "@/hooks/useSmartphones";
import { CartItem } from "@/types/smartphone";
import { useCart } from "@/context/cart-context";
import { PersistentCart, CartButton } from "@/components/cart/persistent-cart";
import AddSmartphoneModal from "@/components/smartphones/AddSmartphoneModal";
import AddBrandModal from "@/components/smartphones/AddBrandModal";
import AddStockModal from "@/components/smartphones/AddStockModal";
import ViewStockModal from "@/components/smartphones/ViewStockModal";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/context/auth-context";

export default function SmartphonesPage() {
  const { addToCart } = useCart();
  const { isOwner } = useAuth();
  const {
    smartphones,
    loading,
    addSmartphone,
    addStock,
    deleteStock,
    updateSmartphone,
    deleteSmartphone,
  } = useSmartphones();
  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "name-asc">("default");

  // Selection Dialog states
  const [selectedModel, setSelectedModel] = useState<GroupedSmartphone | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [enteredPrice, setEnteredPrice] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<"Brand New" | "Used" | "">("");
  const [selectedStockItem, setSelectedStockItem] = useState<SmartphoneStockItem | null>(null);
  const [stockItemSearch, setStockItemSearch] = useState<string>("");

  // Modals state
  const [isAddSmartphoneModalOpen, setIsAddSmartphoneModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);

  // Stock management modals state
  const [stockTargetPhone, setStockTargetPhone] = useState<GroupedSmartphone | null>(null);
  const [viewStockTargetPhone, setViewStockTargetPhone] = useState<GroupedSmartphone | null>(null);

  // 3-dot menu & edit/delete state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTargetPhone, setMenuTargetPhone] = useState<GroupedSmartphone | null>(null);
  const [editSmartphone, setEditSmartphone] = useState<GroupedSmartphone | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<GroupedSmartphone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Keep modal data reactive to real-time updates
  const currentViewPhone = viewStockTargetPhone
    ? smartphones.find((p) => p.id === viewStockTargetPhone.id) || viewStockTargetPhone
    : null;
  const currentAddStockPhone = stockTargetPhone
    ? smartphones.find((p) => p.id === stockTargetPhone.id) || stockTargetPhone
    : null;

  const handleAddStock = async (
    smartphoneId: string,
    stock:
      | Omit<SmartphoneStockItem, "id" | "createdAt">
      | Omit<SmartphoneStockItem, "id" | "createdAt">[]
  ) => {
    if (!isOwner) return;
    await addStock(smartphoneId, stock);
    const count = Array.isArray(stock) ? stock.length : 1;
    setToast({
      open: true,
      message:
        count > 1
          ? `${count} stock units added successfully!`
          : `Stock unit (IMEI: ${(stock as any).imei}) added successfully!`,
      severity: "success",
    });
  };

  const handleDeleteStock = async (smartphoneId: string, stockId: string) => {
    if (!isOwner) return;
    await deleteStock(smartphoneId, stockId);
    setToast({
      open: true,
      message: "Stock unit removed from inventory.",
      severity: "info",
    });
  };

  // 3-dot menu handlers
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, phone: GroupedSmartphone) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuTargetPhone(phone);
  };
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuTargetPhone(null);
  };
  const handleMenuEdit = () => {
    if (menuTargetPhone) {
      setEditSmartphone(menuTargetPhone);
    }
    handleCloseMenu();
  };
  const handleMenuDelete = () => {
    if (menuTargetPhone) {
      setDeleteConfirmOpen(menuTargetPhone);
    }
    handleCloseMenu();
  };
  const handleConfirmDeleteSmartphone = async () => {
    if (!deleteConfirmOpen || !deleteConfirmOpen.id || !isOwner) return;
    try {
      setIsDeleting(true);
      await deleteSmartphone(deleteConfirmOpen.id);
      setToast({
        open: true,
        message: `${deleteConfirmOpen.brand} ${deleteConfirmOpen.model} deleted successfully.`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: "Failed to delete smartphone. Please try again.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(null);
    }
  };

  const handleUpdateSmartphone = async (updated: GroupedSmartphone) => {
    if (!updated.id || !isOwner) return;
    await updateSmartphone(updated.id, {
      brand: updated.brand,
      model: updated.model,
      category: updated.category,
      variants: updated.variants,
    });
    setToast({
      open: true,
      message: `${updated.brand} ${updated.model} updated successfully.`,
      severity: "success",
    });
  };

  // Compute all available brands
  const baseBrands = Array.from(new Set(smartphones.map((p) => p.brand)));
  const allBrands = Array.from(new Set([...baseBrands, ...customBrands])).filter(Boolean);

  // Filtered & Sorted Smartphones
  const filteredSmartphones = smartphones
    .filter((product) => {
      const brandMatch = !searchBrand || product.brand === searchBrand;
      const modelMatch =
        !searchModel ||
        product.model.toLowerCase().includes(searchModel.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchModel.toLowerCase());
      return brandMatch && modelMatch;
    })
    .sort((a, b) => {
      const minPriceA = Math.min(...a.variants.map((v) => v.price));
      const minPriceB = Math.min(...b.variants.map((v) => v.price));
      if (sortBy === "price-low") return minPriceA - minPriceB;
      if (sortBy === "price-high") return minPriceB - minPriceA;
      if (sortBy === "name-asc") return a.model.localeCompare(b.model);
      return 0;
    });

  const handleOpenPriceDialog = (product: GroupedSmartphone) => {
    setSelectedModel(product);
    setSelectedCondition("");
    setSelectedStorage("");
    setSelectedStockItem(null);
    setEnteredPrice("");
    setStockItemSearch("");
  };

  const handleConditionChange = (condition: "Brand New" | "Used") => {
    setSelectedCondition(condition);
    setSelectedStorage("");
    setSelectedStockItem(null);
    setEnteredPrice("");
    setStockItemSearch("");
  };

  const handleStorageChange = (newStorage: string) => {
    setSelectedStorage(newStorage);
    setSelectedStockItem(null);
    setStockItemSearch("");
    if (selectedModel) {
      const variant = selectedModel.variants.find((v) => v.storage === newStorage);
      if (variant) {
        setEnteredPrice(String(variant.price));
      }
    }
  };

  const handleStockItemSelect = (stock: SmartphoneStockItem) => {
    setSelectedStockItem(stock);
  };

  const handleAddToCart = () => {
    if (!selectedModel || !selectedStorage) return;

    const priceValue = Number(enteredPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return;

    const cartItem: Omit<CartItem, "id" | "quantity"> = {
      brand: selectedModel.brand,
      model: selectedModel.model,
      storage: selectedStorage,
      price: priceValue,
      smartphoneId: selectedModel.id,
    };

    if (selectedCondition) {
      cartItem.type = selectedCondition;
    }

    if (selectedStockItem) {
      cartItem.stockItemId = selectedStockItem.id;
      cartItem.imei = selectedStockItem.imei;
      cartItem.type = selectedStockItem.type;
    }

    addToCart(cartItem);

    setSelectedModel(null);
    setSelectedCondition("");
    setSelectedStorage("");
    setSelectedStockItem(null);
    setEnteredPrice("");
    setStockItemSearch("");
  };

  const handleCloseCartDialog = () => {
    setSelectedModel(null);
    setSelectedCondition("");
    setSelectedStorage("");
    setSelectedStockItem(null);
    setEnteredPrice("");
    setStockItemSearch("");
  };

  const handleAddSmartphone = async (newPhone: GroupedSmartphone) => {
    await addSmartphone({
      brand: newPhone.brand,
      model: newPhone.model,
      category: newPhone.category,
      variants: newPhone.variants,
    });
    if (!allBrands.includes(newPhone.brand)) {
      setCustomBrands([...customBrands, newPhone.brand]);
    }
    if (searchBrand && searchBrand !== newPhone.brand) {
      setSearchBrand(newPhone.brand);
    }
  };

  const handleAddBrand = (brandName: string) => {
    if (!allBrands.includes(brandName)) {
      setCustomBrands([...customBrands, brandName]);
      setSearchBrand(brandName);
    }
  };

  const handleResetFilters = () => {
    setSearchBrand("");
    setSearchModel("");
    setSortBy("default");
  };

  const isFiltersActive =
    searchBrand !== "" || searchModel !== "" || sortBy !== "default";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
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
              <SmartphoneIcon sx={{ color: "#7c3aed", fontSize: 22 }} />
              Smartphones Store
            </Typography>
            {!isOwner && (
              <Chip
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
        {/* Brand Tabs */}
        <Paper
          sx={{
            mb: 3,
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={searchBrand || "all"}
            onChange={(_, newValue) => setSearchBrand(newValue === "all" ? "" : newValue)}
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
            <Tab label={`All Brands (${smartphones.length})`} value="all" />
            {allBrands.map((brand) => {
              const count = smartphones.filter((p) => p.brand === brand).length;
              return <Tab key={brand} label={`${brand} (${count})`} value={brand} />;
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
                Filter & Search Smartphones
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
              {isOwner && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<BrandingWatermarkIcon sx={{ fontSize: "1rem" }} />}
                    onClick={() => setIsAddBrandModalOpen(true)}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 1.8,
                      py: 0.75,
                      borderColor: "#ddd6fe",
                      color: "#7c3aed",
                      backgroundColor: "#f5f3ff",
                      "&:hover": { borderColor: "#c4b5fd", backgroundColor: "#ede9fe" },
                    }}
                  >
                    Add Brand
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddSmartphoneModalOpen(true)}
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2,
                      py: 0.75,
                      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                      "&:hover": { background: "linear-gradient(135deg, #6d28d9, #c2410c)" },
                    }}
                  >
                    Add Smartphone
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Grid container spacing={2}>
            {/* Search Input */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Search Model Name"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                placeholder="e.g., iPhone 17, Pixel 8, S24"
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

            {/* Brand Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select
                  value={searchBrand || "all"}
                  label="Brand"
                  onChange={(e) => setSearchBrand(e.target.value === "all" ? "" : e.target.value)}
                >
                  <MenuItem value="all">All Brands ({allBrands.length})</MenuItem>
                  {allBrands.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="default">Default Catalog</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="name-asc">Model Name (A - Z)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Grid Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
              {searchBrand ? `${searchBrand} Smartphones` : "Available Smartphones"}
            </Typography>
            <Chip
              label={`${filteredSmartphones.length} models`}
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
            {filteredSmartphones.map((product, idx) => {
              const minPrice = Math.min(...product.variants.map((v) => v.price));
              const maxPrice = Math.max(...product.variants.map((v) => v.price));

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idx}>
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
                  <CardContent sx={{ flex: 1, p: 2.5, pb: 1.5, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          textTransform: "uppercase",
                          color: "#7c3aed",
                          letterSpacing: "0.05em",
                          pt: 0.5,
                        }}
                      >
                        {product.brand}
                      </Typography>
                      {isOwner && (
                        <Tooltip title="More options">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, product)}
                            sx={{
                              color: "#64748b",
                              p: 0.5,
                              "&:hover": { backgroundColor: "#f1f5f9", color: "#7c3aed" },
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: "#1e293b", fontSize: "1.05rem" }}>
                      {product.model}
                    </Typography>

                    {/* Storage variants chips */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block", mb: 0.75 }}>
                        Available Storage:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                        {product.variants.map((v) => (
                          <Chip
                            key={v.storage}
                            label={v.storage}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              borderColor: "#cbd5e1",
                              color: "#334155",
                              backgroundColor: "#f8fafc",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Price Range Preview */}
                    <Box sx={{ mt: "auto", pt: 1, mb: 1, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                        Starts From
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#7c3aed" }}>
                        Rs. {minPrice.toLocaleString("en-LK")}
                      </Typography>
                    </Box>

                    {/* Stock Status Indicator */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 13, color: (product.stocks?.length || 0) > 0 ? "#10b981" : "#94a3b8" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: (product.stocks?.length || 0) > 0 ? "#10b981" : "#64748b",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        >
                          {(product.stocks?.length || 0) > 0
                            ? `${product.stocks?.length} units in stock`
                            : "0 units in stock"}
                        </Typography>
                      </Box>
                      {(product.stocks?.length || 0) > 0 && (
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.68rem" }}>
                          {product.stocks?.filter((s) => s.type === "Brand New").length || 0} New •{" "}
                          {product.stocks?.filter((s) => s.type === "Used").length || 0} Used
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                      {isOwner && (
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon sx={{ fontSize: "0.95rem !important" }} />}
                          onClick={() => setStockTargetPhone(product)}
                          sx={{
                            borderColor: "#ddd6fe",
                            color: "#7c3aed",
                            backgroundColor: "#f5f3ff",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            textTransform: "none",
                            py: 0.7,
                            borderRadius: 1.5,
                            "&:hover": {
                              borderColor: "#c4b5fd",
                              backgroundColor: "#ede9fe",
                            },
                          }}
                        >
                          Add Stocks
                        </Button>
                      )}
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<StorageIcon sx={{ fontSize: "0.95rem !important" }} />}
                        onClick={() => setViewStockTargetPhone(product)}
                        sx={{
                          borderColor: "#fed7aa",
                          color: "#ea580c",
                          backgroundColor: "#fff7ed",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          textTransform: "none",
                          py: 0.7,
                          borderRadius: 1.5,
                          "&:hover": {
                            borderColor: "#fdba74",
                            backgroundColor: "#ffedd5",
                          },
                        }}
                      >
                        View Stocks {(product.stocks?.length || 0) > 0 ? `(${product.stocks?.length})` : ""}
                      </Button>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleOpenPriceDialog(product)}
                      sx={{
                        background: "linear-gradient(135deg, #7c3aed, #ea580c)",
                        fontWeight: 700,
                        py: 0.85,
                        fontSize: "0.82rem",
                        textTransform: "none",
                        borderRadius: 1.5,
                        boxShadow: "0 3px 8px rgba(124, 58, 237, 0.2)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #6d28d9, #c2410c)",
                        },
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

        {/* Empty State */}
        {!loading && filteredSmartphones.length === 0 && (
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
              No smartphones found
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3, maxWidth: 420, mx: "auto", fontSize: "0.9rem" }}>
              No smartphones matched your active search & filters. You can clear filters or add a new smartphone model.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={handleResetFilters} startIcon={<RestartAltIcon />}>
                Clear Filters
              </Button>
              {isOwner && (
                <Button
                  variant="contained"
                  onClick={() => setIsAddSmartphoneModalOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{ background: "linear-gradient(135deg, #7c3aed, #ea580c)" }}
                >
                  Add New Smartphone
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Container>

      {/* Add to Cart Selection Modal */}
      <Dialog
        open={Boolean(selectedModel)}
        onClose={handleCloseCartDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#7c3aed",
            pb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <SmartphoneIcon sx={{ color: "#7c3aed" }} />
          Select Stock & Add to Cart
        </DialogTitle>

        <DialogContent
          sx={{
            py: 3,
            maxHeight: "90vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {selectedModel && (
            <Stack spacing={3}>
              {/* Product Header */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#f5f3ff",
                  borderRadius: 2,
                  border: "1px solid #ddd6fe",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}
                >
                  {selectedModel.brand}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>
                  {selectedModel.model}
                </Typography>
                {/* Stock summary */}
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    label={`${(selectedModel.stocks || []).filter(s => s.status === "Available").length} in stock`}
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      backgroundColor: "#ecfdf5",
                      color: "#059669",
                      border: "1px solid #a7f3d0",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${(selectedModel.stocks || []).filter(s => s.status === "Available" && s.type === "Brand New").length} New`}
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${(selectedModel.stocks || []).filter(s => s.status === "Available" && s.type === "Used").length} Used`}
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      backgroundColor: "#fffbeb",
                      color: "#d97706",
                      border: "1px solid #fde68a",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                </Box>
              </Box>

              {/* Step 1: Condition Selection */}
              <FormControl component="fieldset" fullWidth>
                <FormLabel
                  component="legend"
                  sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.95rem",
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    "&.Mui-focused": { color: "#7c3aed" },
                  }}
                >
                  <NewReleasesIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                  Step 1: Select Condition
                </FormLabel>

                <Grid container spacing={1.5}>
                  {(["Brand New", "Used"] as const).map((condition) => {
                    const availableCount = (selectedModel.stocks || []).filter(
                      (s) => s.status === "Available" && s.type === condition
                    ).length;
                    const isSelected = selectedCondition === condition;
                    const isDisabled = availableCount === 0;
                    return (
                      <Grid size={{ xs: 6 }} key={condition}>
                        <Paper
                          variant="outlined"
                          onClick={() => !isDisabled && handleConditionChange(condition)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            borderColor: isSelected
                              ? "#7c3aed"
                              : isDisabled
                              ? "#f1f5f9"
                              : "#e2e8f0",
                            backgroundColor: isSelected
                              ? "#f5f3ff"
                              : isDisabled
                              ? "#f8fafc"
                              : "#ffffff",
                            opacity: isDisabled ? 0.5 : 1,
                            transition: "all 0.2s ease",
                            "&:hover": isDisabled
                              ? {}
                              : {
                                  borderColor: "#7c3aed",
                                  backgroundColor: isSelected ? "#f5f3ff" : "#f8fafc",
                                },
                          }}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                            {condition === "Brand New" ? (
                              <NewReleasesIcon sx={{ color: isSelected ? "#7c3aed" : "#2563eb", fontSize: 24 }} />
                            ) : (
                              <HistoryToggleOffIcon sx={{ color: isSelected ? "#7c3aed" : "#d97706", fontSize: 24 }} />
                            )}
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.82rem",
                                color: isSelected ? "#7c3aed" : "#1e293b",
                              }}
                            >
                              {condition === "Brand New" ? "Brand New" : "Used / Pre-Owned"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: isDisabled ? "#94a3b8" : "#64748b",
                              }}
                            >
                              {isDisabled ? "No stock" : `${availableCount} available`}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </FormControl>

              {/* Step 2: Storage Selection (only after condition is chosen) */}
              {selectedCondition && (
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.95rem",
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      "&.Mui-focused": { color: "#7c3aed" },
                    }}
                  >
                    <StorageIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                    Step 2: Select Storage Capacity
                  </FormLabel>

                  <RadioGroup
                    value={selectedStorage}
                    onChange={(e) => handleStorageChange(e.target.value)}
                  >
                    <Stack spacing={1.2}>
                      {(selectedModel.variants || [])
                        .filter((variant) => {
                          const hasStock = (selectedModel.stocks || []).some(
                            (s) =>
                              s.status === "Available" &&
                              s.type === selectedCondition &&
                              s.storage === variant.storage
                          );
                          return hasStock;
                        })
                        .map((variant) => {
                          const countInStock = (selectedModel.stocks || []).filter(
                            (s) =>
                              s.status === "Available" &&
                              s.type === selectedCondition &&
                              s.storage === variant.storage
                          ).length;
                          const isSelected = selectedStorage === variant.storage;
                          return (
                            <Paper
                              key={variant.storage}
                              variant="outlined"
                              onClick={() => handleStorageChange(variant.storage)}
                              sx={{
                                p: 1.5,
                                px: 2,
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                borderRadius: 2,
                                borderColor: isSelected ? "#7c3aed" : "#e2e8f0",
                                backgroundColor: isSelected ? "#f5f3ff" : "#ffffff",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#7c3aed",
                                  backgroundColor: isSelected ? "#f5f3ff" : "#f8fafc",
                                },
                              }}
                            >
                              <FormControlLabel
                                value={variant.storage}
                                control={
                                  <Radio
                                    size="small"
                                    sx={{
                                      color: "#7c3aed",
                                      "&.Mui-checked": { color: "#7c3aed" },
                                    }}
                                  />
                                }
                                label={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        sx={{
                                          fontWeight: 700,
                                          color: "#1e293b",
                                          fontSize: "0.95rem",
                                        }}
                                      >
                                        {variant.storage}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: "#64748b",
                                        }}
                                      >
                                        {countInStock} unit{countInStock !== 1 ? "s" : ""} in stock
                                      </Typography>
                                    </Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        color: "#7c3aed",
                                        fontSize: "0.9rem",
                                        ml: 3,
                                      }}
                                    >
                                      Rs. {variant.price.toLocaleString("en-LK")}
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0, width: "100%" }}
                              />
                            </Paper>
                          );
                        })}
                      {(selectedModel.variants || []).filter((variant) => {
                        const hasStock = (selectedModel.stocks || []).some(
                          (s) =>
                            s.status === "Available" &&
                            s.type === selectedCondition &&
                            s.storage === variant.storage
                        );
                        return hasStock;
                      }).length === 0 && (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            textAlign: "center",
                            backgroundColor: "#fef2f2",
                            borderColor: "#fecaca",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#dc2626",
                              fontSize: "0.85rem",
                            }}
                          >
                            No {selectedCondition} stock available for any storage capacity.
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              )}

              {/* Step 3: Available Stock Items (after condition + storage chosen) */}
              {selectedCondition && selectedStorage && (
                <FormControl component="fieldset" fullWidth>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.95rem",
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      "&.Mui-focused": { color: "#7c3aed" },
                    }}
                  >
                    <CheckCircleIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                    Step 3: Select Stock Item
                  </FormLabel>

                  {/* IMEI Search Bar */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by IMEI number..."
                    value={stockItemSearch}
                    onChange={(e) => setStockItemSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                          </InputAdornment>
                        ),
                        endAdornment: stockItemSearch ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setStockItemSearch("")}
                              sx={{ p: 0.25 }}
                            >
                              <CloseIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        backgroundColor: "#f8fafc",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#7c3aed",
                        },
                      },
                    }}
                  />

                  <RadioGroup
                    value={selectedStockItem?.id || ""}
                    onChange={(e) => {
                      const stock = (selectedModel.stocks || []).find(
                        (s) => s.id === e.target.value
                      );
                      if (stock) handleStockItemSelect(stock);
                    }}
                  >
                    <Stack spacing={1}>
                      {(() => {
                        const searchLower = stockItemSearch.trim().toLowerCase();
                        const filteredStocks = (selectedModel.stocks || [])
                          .filter(
                            (s) =>
                              s.status === "Available" &&
                              s.type === selectedCondition &&
                              s.storage === selectedStorage
                          )
                          .filter((s) => {
                            if (!searchLower) return true;
                            return s.imei.toLowerCase().includes(searchLower);
                          });

                        if (filteredStocks.length === 0) {
                          return (
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                borderRadius: 2,
                                textAlign: "center",
                                backgroundColor: "#f8fafc",
                                borderColor: "#e2e8f0",
                              }}
                            >
                              <SearchIcon
                                sx={{
                                  fontSize: 32,
                                  color: "#cbd5e1",
                                  mb: 0.75,
                                  display: "block",
                                  mx: "auto",
                                }}
                              />
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: "#64748b",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {searchLower
                                  ? `No stock items matching IMEI "${stockItemSearch}"`
                                  : "No matching stock items available"}
                              </Typography>
                              {searchLower && (
                                <Button
                                  size="small"
                                  onClick={() => setStockItemSearch("")}
                                  sx={{
                                    mt: 1,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "0.78rem",
                                    color: "#7c3aed",
                                  }}
                                >
                                  Clear search
                                </Button>
                              )}
                            </Paper>
                          );
                        }

                        return filteredStocks.map((stock) => {
                          const isSelected = selectedStockItem?.id === stock.id;
                          const batteryColor =
                            (stock.batteryHealth || 100) >= 88
                              ? "#10b981"
                              : (stock.batteryHealth || 100) >= 80
                              ? "#f59e0b"
                              : "#ef4444";
                          return (
                            <Paper
                              key={stock.id}
                              variant="outlined"
                              onClick={() => handleStockItemSelect(stock)}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                cursor: "pointer",
                                borderColor: isSelected ? "#7c3aed" : "#e2e8f0",
                                backgroundColor: isSelected ? "#f5f3ff" : "#ffffff",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#7c3aed",
                                  backgroundColor: isSelected ? "#f5f3ff" : "#f8fafc",
                                },
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                <Radio
                                  size="small"
                                  checked={isSelected}
                                  onChange={() => handleStockItemSelect(stock)}
                                  onClick={(e) => e.stopPropagation()}
                                  value={stock.id}
                                  sx={{
                                    color: "#7c3aed",
                                    "&.Mui-checked": { color: "#7c3aed" },
                                    p: 0,
                                    mt: 0.25,
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  {/* Top row: Type + IMEI */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 0.75,
                                      flexWrap: "wrap",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Chip
                                      size="small"
                                      label={stock.type}
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        backgroundColor:
                                          stock.type === "Brand New" ? "#eff6ff" : "#fffbeb",
                                        color: stock.type === "Brand New" ? "#2563eb" : "#d97706",
                                        border: "1px solid",
                                        borderColor:
                                          stock.type === "Brand New" ? "#bfdbfe" : "#fde68a",
                                        "& .MuiChip-label": { px: 0.8 },
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.4,
                                      }}
                                    >
                                      <QrCodeScannerIcon
                                        sx={{ fontSize: 12, color: "#64748b" }}
                                      />
                                      <Typography
                                        sx={{
                                          fontSize: "0.72rem",
                                          fontWeight: 700,
                                          color: "#475569",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {stock.imei}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Details row */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 0.75,
                                      mb: stock.notes ? 0.5 : 0,
                                    }}
                                  >
                                    {stock.type === "Used" && stock.batteryHealth != null && (
                                      <Chip
                                        size="small"
                                        icon={
                                          <BatteryChargingFullIcon
                                            sx={{ fontSize: 12, color: batteryColor }}
                                          />
                                        }
                                        label={`${stock.batteryHealth}%`}
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          backgroundColor: `${batteryColor}15`,
                                          color: batteryColor,
                                          border: `1px solid ${batteryColor}40`,
                                          "& .MuiChip-label": { px: 0.6, pl: 0.2 },
                                          "& .MuiChip-icon": { ml: 0.5 },
                                        }}
                                      />
                                    )}
                                    {stock.color && (
                                      <Chip
                                        size="small"
                                        icon={
                                          <PaletteIcon
                                            sx={{ fontSize: 12, color: "#7c3aed" }}
                                          />
                                        }
                                        label={stock.color}
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          backgroundColor: "#f5f3ff",
                                          color: "#7c3aed",
                                          border: "1px solid #ddd6fe",
                                          "& .MuiChip-label": { px: 0.6, pl: 0.2 },
                                          "& .MuiChip-icon": { ml: 0.5 },
                                        }}
                                      />
                                    )}
                                  </Box>

                                  {/* Notes */}
                                  {stock.notes && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        color: "#64748b",
                                        fontStyle: "italic",
                                        fontSize: "0.7rem",
                                        mt: 0.25,
                                      }}
                                    >
                                      "{stock.notes}"
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          );
                        });
                      })()}
                    </Stack>
                  </RadioGroup>

                  <Alert
                    severity="info"
                    sx={{
                      mt: 1.5,
                      borderRadius: 1.5,
                      backgroundColor: "#f0f9ff",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      "& .MuiAlert-icon": { color: "#0284c7" },
                      fontSize: "0.78rem",
                      py: 0.75,
                    }}
                  >
                    {selectedStockItem
                      ? "Stock item selected. You can adjust the price below before adding to cart."
                      : "Select a specific stock item from the list above to add it to your cart."}
                  </Alert>
                </FormControl>
              )}

              {/* Step 4: Price Entry */}
              {selectedStorage && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                      Selling Price in LKR
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Price (LKR)"
                      value={enteredPrice}
                      onChange={(event) => setEnteredPrice(event.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                        },
                        htmlInput: { min: 0, step: 1000 },
                      }}
                      helperText="Enter or customize the selling price before adding to cart."
                    />
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleCloseCartDialog}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={!selectedCondition || !selectedStorage || !selectedStockItem || !enteredPrice || Number(enteredPrice) <= 0}
            startIcon={<AddShoppingCartIcon />}
            sx={{
              background: "linear-gradient(135deg, #7c3aed, #ea580c)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": {
                background: "linear-gradient(135deg, #6d28d9, #c2410c)",
              },
            }}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3-Dot Card Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
              minWidth: 170,
              p: 0.5,
              border: "1px solid #e2e8f0",
            },
          },
        }}
      >
        <MenuItem onClick={handleMenuEdit} sx={{ borderRadius: 1.25 }}>
          <ListItemIcon sx={{ color: "#7c3aed", minWidth: 36 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#1e293b" }}>
                Edit Smartphone
              </Typography>
            }
          />
        </MenuItem>
        <Tooltip
          title={
            (menuTargetPhone?.stocks?.length || 0) > 0
              ? `Delete after removing all ${menuTargetPhone?.stocks?.length} stock unit(s)`
              : ""
          }
          placement="left"
        >
          <span style={{ display: "block" }}>
            <MenuItem
              onClick={handleMenuDelete}
              disabled={(menuTargetPhone?.stocks?.length || 0) > 0}
              sx={{
                borderRadius: 1.25,
                "&.Mui-disabled": { opacity: 0.45 },
              }}
            >
              <ListItemIcon sx={{ color: "#ef4444", minWidth: 36 }}>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#ef4444" }}>
                    Delete Smartphone
                  </Typography>
                }
              />
            </MenuItem>
          </span>
        </Tooltip>
      </Menu>

      {/* Delete Smartphone Confirmation */}
      <Dialog
        open={Boolean(deleteConfirmOpen)}
        onClose={() => !isDeleting && setDeleteConfirmOpen(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, boxShadow: "0 20px 45px rgba(239, 68, 68, 0.18)" },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#ffffff",
            px: 3,
            py: 2.2,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <DeleteIcon sx={{ fontSize: 26 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Delete Smartphone
            </Typography>
            {deleteConfirmOpen && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {deleteConfirmOpen.brand} {deleteConfirmOpen.model}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2.5 }}>
          <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this smartphone model from the catalog?
          </Typography>
          <Alert
            severity="info"
            sx={{ mt: 2, borderRadius: 2, backgroundColor: "#f0f9ff", color: "#0369a1" }}
          >
            <strong>Note:</strong> Delete is only permitted when there are <strong>0 stock units</strong> remaining
            for this model to prevent accidental data loss.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setDeleteConfirmOpen(null)}
            disabled={isDeleting}
            sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteSmartphone}
            disabled={isDeleting}
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{
              backgroundColor: "#ef4444",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Smartphone Modal */}
      {editSmartphone && (
        <AddSmartphoneModal
          open={Boolean(editSmartphone)}
          onClose={() => setEditSmartphone(null)}
          onAdd={(phone) => {
            handleUpdateSmartphone({ ...phone, id: editSmartphone.id });
            setEditSmartphone(null);
          }}
          existingBrands={allBrands}
          onOpenAddBrandModal={() => {}}
          editingSmartphone={editSmartphone}
        />
      )}

      {/* Add Smartphone Modal */}
      <AddSmartphoneModal
        open={isAddSmartphoneModalOpen}
        onClose={() => setIsAddSmartphoneModalOpen(false)}
        onAdd={handleAddSmartphone}
        existingBrands={allBrands}
        onOpenAddBrandModal={() => {
          setIsAddSmartphoneModalOpen(false);
          setIsAddBrandModalOpen(true);
        }}
      />

      {/* Add Brand Modal */}
      <AddBrandModal
        open={isAddBrandModalOpen}
        onClose={() => setIsAddBrandModalOpen(false)}
        onAddBrand={handleAddBrand}
        existingBrands={allBrands}
      />

      {/* Add Stock Modal - owners only */}
      {isOwner && (
        <AddStockModal
          open={Boolean(stockTargetPhone)}
          onClose={() => setStockTargetPhone(null)}
          smartphone={currentAddStockPhone}
          onAddStock={handleAddStock}
        />
      )}

      {/* View Stock Modal */}
      <ViewStockModal
        open={Boolean(viewStockTargetPhone)}
        onClose={() => setViewStockTargetPhone(null)}
        smartphone={currentViewPhone}
        onOpenAddStock={(phone) => isOwner && setStockTargetPhone(phone)}
        onDeleteStock={handleDeleteStock}
        isOwner={isOwner}
      />

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <PersistentCart />
    </Box>
  );
}
