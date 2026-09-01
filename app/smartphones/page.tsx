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
import { groupedSmartphoneProducts } from "@/data/smartphoneData";
import { GroupedSmartphone } from "@/types/smartphone";
import { useCart } from "@/context/cart-context";
import { PersistentCart, CartButton } from "@/components/cart/persistent-cart";
import AddSmartphoneModal from "@/components/smartphones/AddSmartphoneModal";
import AddBrandModal from "@/components/smartphones/AddBrandModal";

export default function SmartphonesPage() {
  const { addToCart } = useCart();
  const [smartphones, setSmartphones] = useState<GroupedSmartphone[]>(groupedSmartphoneProducts);
  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "flagship" | "mid-range" | "budget">("all");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "name-asc">("default");

  // Selection Dialog states
  const [selectedModel, setSelectedModel] = useState<GroupedSmartphone | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [enteredPrice, setEnteredPrice] = useState("");

  // Modals state
  const [isAddSmartphoneModalOpen, setIsAddSmartphoneModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);

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
      const catMatch = categoryFilter === "all" || product.category === categoryFilter;
      return brandMatch && modelMatch && catMatch;
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
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      setSelectedStorage(defaultVariant.storage);
      setEnteredPrice(String(defaultVariant.price));
    } else {
      setSelectedStorage("");
      setEnteredPrice("");
    }
  };

  const handleStorageChange = (newStorage: string) => {
    setSelectedStorage(newStorage);
    if (selectedModel) {
      const variant = selectedModel.variants.find((v) => v.storage === newStorage);
      if (variant) {
        setEnteredPrice(String(variant.price));
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedModel || !selectedStorage) return;

    const priceValue = Number(enteredPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return;

    addToCart({
      brand: selectedModel.brand,
      model: selectedModel.model,
      storage: selectedStorage,
      price: priceValue,
    });

    setSelectedModel(null);
    setSelectedStorage("");
    setEnteredPrice("");
  };

  const handleAddSmartphone = (newPhone: GroupedSmartphone) => {
    setSmartphones([newPhone, ...smartphones]);
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
    setCategoryFilter("all");
    setSortBy("default");
  };

  const isFiltersActive =
    searchBrand !== "" || searchModel !== "" || categoryFilter !== "all" || sortBy !== "default";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(30, 64, 175, 0.08)",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 800, color: "#1e40af", display: "flex", alignItems: "center", gap: 1 }}
          >
            <SmartphoneIcon sx={{ color: "#1e40af" }} />
            Smartphones Store
          </Typography>
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
                backgroundColor: "#1e40af",
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
                color: "#1e40af",
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
              <FilterAltIcon sx={{ color: "#1e40af", fontSize: 20 }} />
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
                  borderColor: "#bfdbfe",
                  color: "#1e40af",
                  backgroundColor: "#eff6ff",
                  "&:hover": { borderColor: "#93c5fd", backgroundColor: "#dbeafe" },
                }}
              >
                Add Brand
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddSmartphoneModalOpen(true)}
                sx={{
                  background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  py: 0.75,
                  boxShadow: "0 4px 14px rgba(30, 64, 175, 0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #1e3a8a, #2563eb)" },
                }}
              >
                Add Smartphone
              </Button>
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
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
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

            {/* Category Tier */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tier Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Tier Category"
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                >
                  <MenuItem value="all">All Tiers</MenuItem>
                  <MenuItem value="flagship">Flagship Premium</MenuItem>
                  <MenuItem value="mid-range">Mid-Range</MenuItem>
                  <MenuItem value="budget">Budget Tier</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                background: "linear-gradient(135deg, #1e40af15, #3b82f615)",
                border: "1px solid #93c5fd",
                color: "#1e40af",
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        {/* Products Grid */}
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
                      boxShadow: "0 12px 24px rgba(30, 64, 175, 0.12)",
                      borderColor: "#3b82f6",
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1, p: 2.5, pb: 1.5, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          textTransform: "uppercase",
                          color: "#1e40af",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {product.brand}
                      </Typography>
                      {product.category && (
                        <Chip
                          label={product.category.replace("-", " ")}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            backgroundColor:
                              product.category === "flagship"
                                ? "#fef3c7"
                                : product.category === "mid-range"
                                ? "#eff6ff"
                                : "#f1f5f9",
                            color:
                              product.category === "flagship"
                                ? "#b45309"
                                : product.category === "mid-range"
                                ? "#1e40af"
                                : "#475569",
                          }}
                        />
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
                      <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#1e40af" }}>
                        Rs. {minPrice.toLocaleString("en-LK")}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 13, color: "#10b981" }} />
                      <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700, fontSize: "0.7rem" }}>
                        In Stock ({product.variants.length} storage options)
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleOpenPriceDialog(product)}
                      sx={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        fontWeight: 700,
                        py: 0.9,
                        fontSize: "0.85rem",
                        textTransform: "none",
                        borderRadius: 1.5,
                        boxShadow: "0 3px 8px rgba(30, 64, 175, 0.2)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
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

        {/* Empty State */}
        {filteredSmartphones.length === 0 && (
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
              <Button
                variant="contained"
                onClick={() => setIsAddSmartphoneModalOpen(true)}
                startIcon={<AddIcon />}
                sx={{ background: "linear-gradient(135deg, #1e40af, #3b82f6)" }}
              >
                Add New Smartphone
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Storage & Price Selection Modal */}
      <Dialog
        open={Boolean(selectedModel)}
        onClose={() => setSelectedModel(null)}
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
        <DialogTitle sx={{ fontWeight: 800, color: "#1e40af", pb: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #e2e8f0" }}>
          <SmartphoneIcon sx={{ color: "#1e40af" }} />
          Select Storage & Selling Price
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {selectedModel && (
            <Stack spacing={3}>
              {/* Product Header */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#eff6ff",
                  borderRadius: 2,
                  border: "1px solid #bfdbfe",
                }}
              >
                <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>
                  {selectedModel.brand}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>
                  {selectedModel.model}
                </Typography>
              </Box>

              {/* Radio Buttons for Storage Selection */}
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
                    "&.Mui-focused": { color: "#1e40af" },
                  }}
                >
                  <StorageIcon fontSize="small" sx={{ color: "#1e40af" }} />
                  Select Storage Capacity
                </FormLabel>

                <RadioGroup
                  value={selectedStorage}
                  onChange={(e) => handleStorageChange(e.target.value)}
                >
                  <Stack spacing={1.2}>
                    {selectedModel.variants.map((variant) => {
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
                            borderColor: isSelected ? "#1e40af" : "#e2e8f0",
                            backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#1e40af",
                              backgroundColor: isSelected ? "#eff6ff" : "#f8fafc",
                            },
                          }}
                        >
                          <FormControlLabel
                            value={variant.storage}
                            control={<Radio size="small" sx={{ color: "#1e40af", "&.Mui-checked": { color: "#1e40af" } }} />}
                            label={
                              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                                  {variant.storage}
                                </Typography>
                                <Typography sx={{ fontWeight: 700, color: "#1e40af", fontSize: "0.9rem", ml: 3 }}>
                                  Rs. {variant.price.toLocaleString("en-LK")}
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, width: "100%" }}
                          />
                        </Paper>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Divider />

              {/* Price Entry */}
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
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setSelectedModel(null)}
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
            disabled={!selectedStorage || !enteredPrice || Number(enteredPrice) <= 0}
            startIcon={<AddShoppingCartIcon />}
            sx={{
              background: "linear-gradient(135deg, #1e40af, #3b82f6)",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: 1.5,
              "&:hover": {
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              },
            }}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

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

      <PersistentCart />
    </Box>
  );
}
