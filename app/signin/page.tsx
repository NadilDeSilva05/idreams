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
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/context/auth-context";

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("ShopOwner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const res = await signIn(email, password, selectedRole);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      setErrorMsg(res.error || "Invalid email or password.");
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
      <Container maxWidth="xs">
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
            Store Management & POS Portal
          </Typography>
        </Box>

        {/* Clean Login Card */}
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
              Sign In
            </Typography>

            {/* Role Selector */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3 }}>
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
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  "&:hover": { borderColor: "#7c3aed" },
                }}
              >
                <AdminPanelSettingsIcon
                  sx={{
                    fontSize: 28,
                    color: selectedRole === "ShopOwner" ? "#7c3aed" : "#94a3b8",
                  }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#0f172a", lineHeight: 1.2 }}>
                    Shop Owner
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.68rem" }}>
                    Full access
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
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  "&:hover": { borderColor: "#ea580c" },
                }}
              >
                <StorefrontIcon
                  sx={{
                    fontSize: 28,
                    color: selectedRole === "Shopkeeper" ? "#ea580c" : "#94a3b8",
                  }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#0f172a", lineHeight: 1.2 }}>
                    Shopkeeper
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.68rem" }}>
                    POS & Billing only
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Role Description */}
            {/* <Box
              sx={{
                p: 1.5,
                mb: 2.5,
                borderRadius: 2,
                backgroundColor: selectedRole === "ShopOwner" ? "#f5f3ff" : "#fff7ed",
                border: `1px solid ${selectedRole === "ShopOwner" ? "#ddd6fe" : "#fed7aa"}`,
              }}
            >
              <Typography variant="caption" sx={{ color: selectedRole === "ShopOwner" ? "#7c3aed" : "#ea580c", fontWeight: 700, display: "block" }}>
                {selectedRole === "ShopOwner" ? "Shop Owner — Full Access" : "Shopkeeper — Restricted Access"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                {selectedRole === "ShopOwner"
                  ? "Can manage inventory, add/edit/delete products, stocks, and bills."
                  : "Can only use POS cart & billing. Cannot add, edit, or delete products, stocks, or bills."}
              </Typography>
            </Box> */}

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

            <form onSubmit={handleSignIn}>
              <Box sx={{ display: "grid", gap: 2 }}>
                {/* Email Field */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="sanjeewa@idreams.lk"
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
                </Box>

                {/* Password Field */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
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
                </Box>

                {/* Remember Me */}
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ color: "#7c3aed", "&.Mui-checked": { color: "#7c3aed" }, p: 0.5 }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.82rem" }}>Remember me</Typography>}
                />

                {/* Submit Button */}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon sx={{ fontSize: 19 }} />}
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
                  {loading ? "Signing In..." : `Sign In as ${selectedRole === "ShopOwner" ? "Shop Owner" : "Shopkeeper"}`}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 2.5 }} />

            {/* Link to Sign Up */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.84rem" }}>
                Need a new account?{" "}
                <Link
                  href="/signup"
                  style={{
                    color: "#7c3aed",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Register here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
