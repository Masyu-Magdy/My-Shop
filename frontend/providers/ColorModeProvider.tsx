"use client";

import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/lib/theme";

// Single fixed design mode - no light/dark toggle. The component name is kept
// so existing imports across the app (`ColorModeProvider`) don't need to change.
export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
