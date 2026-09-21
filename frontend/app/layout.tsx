import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeRegistry from "@/providers/ThemeRegistry";
import { ColorModeProvider } from "@/providers/ColorModeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OfflineBanner from "@/components/layout/OfflineBanner";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: { default: "MyShop", template: "%s | MyShop" },
  description:
    "Discover the latest products at the best prices, with fast, reliable delivery.",

  icons: {
    icon: "/cart.svg",
    shortcut: "/cart.svg",
    apple: "/cart.svg",
  },

  openGraph: {
    title: "MyShop",
    description:
      "Discover the latest products at the best prices, with fast, reliable delivery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${sora.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeRegistry>
          <ColorModeProvider>
            <QueryProvider>
              <AuthProvider>
                <Navbar />
                <div className="min-h-[70vh]">{children}</div>
                <Footer />
                <Toaster position="top-center" />
                <OfflineBanner />
              </AuthProvider>
            </QueryProvider>
          </ColorModeProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
