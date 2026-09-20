"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { IconButton, Badge, Drawer } from "@mui/material";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/hooks/useCart";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center gap-4">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-lg "
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
              }}
            >
              <ShoppingCart size={20} />
            </span>
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              MyShop
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition ${
                  pathname === link.href
                    ? "text-(--color-primary)"
                    : "text-gray-700 hover:text-(--color-primary)"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <IconButton component={Link} href="/products" aria-label="Search">
            <Search size={20} />
          </IconButton>

          <IconButton component={Link} href="/wishlist" aria-label="Wishlist">
            <Heart size={20} />
          </IconButton>

          <IconButton component={Link} href="/cart" aria-label="Cart">
            <Badge badgeContent={itemsCount} color="primary">
              <ShoppingCart size={20} />
            </Badge>
          </IconButton>

          {user ? (
            <IconButton
              component={Link}
              href={user.role === "admin" ? "/admin" : "/profile"}
              aria-label="Account"
            >
              <UserIcon size={20} />
            </IconButton>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-block text-sm font-semibold px-4 py-2 rounded-full bg-(--color-primary) text-white hover:opacity-90 transition"
            >
              Sign in
            </Link>
          )}

          <IconButton
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </IconButton>
        </div>
      </div>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <div className="w-72 p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <span
              className="font-bold text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Menu
            </span>
            <IconButton onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </IconButton>
          </div>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cart
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t">
            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin" : "/profile"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  {user.role === "admin" ? (
                    <LayoutDashboard size={16} />
                  ) : (
                    <UserIcon size={16} />
                  )}
                  {user.role === "admin" ? "Admin dashboard" : "My account"}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-start py-2.5 px-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center text-sm font-semibold px-4 py-2.5 rounded-full bg-(--color-primary) text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
