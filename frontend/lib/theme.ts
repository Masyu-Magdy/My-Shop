import { createTheme } from "@mui/material/styles";

/**
 * Fixed, single design mode (no light/dark toggle). Palette: deep violet
 * primary with an emerald accent, on a clean off-white surface - tuned for
 * a modern, trustworthy storefront rather than the default MUI blue/purple.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4C1D95", light: "#7C3AED", dark: "#2E1065", contrastText: "#ffffff" },
    secondary: { main: "#059669", contrastText: "#ffffff" },
    background: { default: "#FAFAF9", paper: "#FFFFFF" },
    text: { primary: "#18181B", secondary: "#52525B" },
    error: { main: "#DC2626" },
    warning: { main: "#D97706" },
    success: { main: "#059669" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
    h1: { fontFamily: "var(--font-display, Sora, sans-serif)" },
    h2: { fontFamily: "var(--font-display, Sora, sans-serif)" },
    h3: { fontFamily: "var(--font-display, Sora, sans-serif)" },
    h4: { fontFamily: "var(--font-display, Sora, sans-serif)" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 999 } } },
    MuiTextField: { defaultProps: { variant: "outlined" } },
  },
});

// Kept for any file still importing getTheme(mode) - the mode argument is now ignored.
export const getTheme = (_mode?: "light" | "dark") => theme;
