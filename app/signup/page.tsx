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
  Chip,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !shopName.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
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
      shopName: shopName.trim(),
      phone: phone.trim(),
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
            Register New Shopkeeper Account
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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.1rem" }}>
                Create Account
              </Typography>
              <Chip
                label="Store Registration"
                size="small"
                sx={{
                  backgroundColor: "#f5f3ff",
                  color: "#7c3aed",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  border: "1px solid #ddd6fe",
                }}
              />
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

                {/* Shop / Store Name */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                    Store / Branch Name *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="iDreams Colombo Flagship"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <StoreRoundedIcon sx={{ color: "#94a3b8", fontSize: 19 }} />
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
                        I confirm I am an authorized shopkeeper for this store.
                      </Typography>
                    }
                  />
                </Grid>

                {/* Submit Button with Logo's Purple to Sunset Orange Gradient */}
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon sx={{ fontSize: 19 }} />}
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #ea580c 100%)",
                      fontWeight: 700,
                      py: 1.15,
                      fontSize: "0.92rem",
                      textTransform: "none",
                      borderRadius: 2,
                      boxShadow: "0 6px 18px rgba(124, 58, 237, 0.28)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #c2410c 100%)",
                        boxShadow: "0 8px 22px rgba(124, 58, 237, 0.38)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {loading ? "Creating Account..." : "Create Shopkeeper Account"}
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
