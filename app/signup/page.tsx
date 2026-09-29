"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/context/auth-context";

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("ShopOwner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [ownerUid, setOwnerUid] = useState(""); // Store Code for Shopkeeper

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (selectedRole === "Shopkeeper" && !ownerUid.trim()) {
      setErrorMsg("Please enter the Store Code provided by your Shop Owner.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please accept the store authorization agreement.");
      return;
    }

    setLoading(true);
    const res = await signUp({
      name: name.trim(),
      email: email.trim(),
      password,
      shopName: "iDreams",
      phone: phone.trim(),
      role: selectedRole,
      ownerUid: selectedRole === "Shopkeeper" ? ownerUid.trim() : undefined,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Account registered successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      setErrorMsg(res.error || "Failed to register account.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(234, 88, 12, 0.04) 0%, transparent 45%), #f8fafc",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Brand Logo & Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
              position: "relative",
              width: "100%",
              maxWidth: 240,
              height: 70,
            }}
          >
            <img
              src="/Images/i Dreams.png"
              alt="iDreams Logo"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
            Register New Account
          </Typography>
        </Box>

        {/* Clean Sign Up Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(124, 58, 237, 0.06)",
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 3.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.1rem", mb: 2.5 }}>
              Create Account
            </Typography>

            {/* Role Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1 }}>
                Account Role *
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <Paper
                  variant="outlined"
                  onClick={() => setSelectedRole("ShopOwner")}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    borderWidth: 2,
                    borderColor: selectedRole === "ShopOwner" ? "#7c3aed" : "#e2e8f0",
                    backgroundColor: selectedRole === "ShopOwner" ? "#f5f3ff" : "#ffffff",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    "&:hover": { borderColor: "#7c3aed" },
                  }}
                >
                  <AdminPanelSettingsIcon
                    sx={{
                      fontSize: 26,
                      color: selectedRole === "ShopOwner" ? "#7c3aed" : "#94a3b8",
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#0f172a", lineHeight: 1.2 }}>
                      Shop Owner
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.68rem" }}>
                      Full access to all features
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  variant="outlined"
                  onClick={() => setSelectedRole("Shopkeeper")}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    borderWidth: 2,
                    borderColor: selectedRole === "Shopkeeper" ? "#ea580c" : "#e2e8f0",
                    backgroundColor: selectedRole === "Shopkeeper" ? "#fff7ed" : "#ffffff",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    "&:hover": { borderColor: "#ea580c" },
                  }}
                >
                  <StorefrontIcon
                    sx={{
                      fontSize: 26,
                      color: selectedRole === "Shopkeeper" ? "#ea580c" : "#94a3b8",
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#0f172a", lineHeight: 1.2 }}>
                      Shopkeeper
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.68rem" }}>
                      POS & Billing only
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Permission note */}
              {/* <Box
                sx={{
                  mt: 1.5,
                  p: 1.25,
                  borderRadius: 1.5,
                  backgroundColor: selectedRole === "ShopOwner" ? "#f5f3ff" : "#fff7ed",
                  border: `1px solid ${selectedRole === "ShopOwner" ? "#ddd6fe" : "#fed7aa"}`,
                }}
              >
                <Typography variant="caption" sx={{ color: selectedRole === "ShopOwner" ? "#7c3aed" : "#ea580c", fontWeight: 600, fontSize: "0.72rem" }}>
                  {selectedRole === "ShopOwner"
                    ? "✓ Can add, edit, delete products, stocks & bills — full management control."
                    : "✓ Can use POS cart & create bills.  ✗ Cannot add/edit/delete products, stocks, or delete bills."}
                </Typography>
              </Box> */}
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.84rem" }}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: "0.84rem" }}>
                {successMsg}
              </Alert>
            )}

            <form onSubmit={handleSignUp}>
              <Grid container spacing={2}>
                {/* Full Name */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Full Name *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nuwan Jayawardena"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonRoundedIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        "&:hover": { backgroundColor: "#ffffff" },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& fieldset": { borderColor: "#7c3aed" },
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Contact Phone */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Contact Phone *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneRoundedIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        "&:hover": { backgroundColor: "#ffffff" },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& fieldset": { borderColor: "#7c3aed" },
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Email Address */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Email Address *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    placeholder="nuwan@idreams.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        "&:hover": { backgroundColor: "#ffffff" },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& fieldset": { borderColor: "#7c3aed" },
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Password */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Password *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        "&:hover": { backgroundColor: "#ffffff" },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& fieldset": { borderColor: "#7c3aed" },
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Confirm Password *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f8fafc",
                        "&:hover": { backgroundColor: "#ffffff" },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& fieldset": { borderColor: "#7c3aed" },
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Store Code — only for Shopkeeper */}
                {selectedRole === "Shopkeeper" && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#ea580c", display: "block", mb: 0.5 }}>
                      Store Code * <Typography component="span" variant="caption" sx={{ color: "#94a3b8", fontWeight: 400 }}>(provided by your Shop Owner)</Typography>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Paste the Store Code here"
                      value={ownerUid}
                      onChange={(e) => setOwnerUid(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AdminPanelSettingsIcon sx={{ color: "#ea580c", fontSize: 19 }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "#fff7ed",
                          "&:hover": { backgroundColor: "#ffffff" },
                          "&.Mui-focused": {
                            backgroundColor: "#ffffff",
                            "& fieldset": { borderColor: "#ea580c" },
                          },
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                      Ask your Shop Owner to share their Store Code from Settings → My Store Code.
                    </Typography>
                  </Grid>
                )}

                {/* Agreement */}
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        sx={{ color: "#7c3aed", "&.Mui-checked": { color: "#7c3aed" }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.82rem" }}>
                        I confirm I am an authorized{" "}
                        {selectedRole === "ShopOwner" ? "shop owner" : "shopkeeper"} for this store.
                      </Typography>
                    }
                  />
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon sx={{ fontSize: 19 }} />}
                    sx={{
                      background: selectedRole === "ShopOwner"
                        ? "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #ea580c 100%)"
                        : "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                      fontWeight: 700,
                      py: 1.15,
                      fontSize: "0.92rem",
                      textTransform: "none",
                      borderRadius: 2,
                      boxShadow: "0 6px 18px rgba(124, 58, 237, 0.28)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        background: selectedRole === "ShopOwner"
                          ? "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #c2410c 100%)"
                          : "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                        boxShadow: "0 8px 22px rgba(124, 58, 237, 0.38)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {loading
                      ? "Creating Account..."
                      : `Create ${selectedRole === "ShopOwner" ? "Shop Owner" : "Shopkeeper"} Account`}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Divider sx={{ my: 2.5 }} />

            {/* Link back to Sign In */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.84rem" }}>
                Already have an account?{" "}
                <Link
                  href="/signin"
                  style={{
                    color: "#7c3aed",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
