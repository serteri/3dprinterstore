"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Layers } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/custom", label: "Custom Order" },
  { href: "/about", label: "About" },
];

type NavbarProps = {
  isAdminAuthenticated?: boolean;
};

export default function Navbar({ isAdminAuthenticated = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const navLinks = isAdminAuthenticated
    ? [...baseNavLinks, { href: "/admin/products", label: "Admin" }]
    : baseNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[70px] sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <Layers
            className="shrink-0 text-zinc-200 transition-transform group-hover:rotate-12"
            size={22}
            strokeWidth={1.5}
          />
          <span className="truncate text-[13px] font-semibold uppercase tracking-[0.22em] text-zinc-100 sm:text-[15px]">
            PERA DYNAMICS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-zinc-100 ${
                link.label === "Admin"
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full p-2 text-zinc-400 transition-colors hover:text-zinc-100"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={22} strokeWidth={1.5} />
            {/* Cart count badge */}
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] font-bold text-zinc-950">
              {itemCount}
            </span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-100 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <nav className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-zinc-100 ${
                    link.label === "Admin" ? "text-zinc-500" : "text-zinc-300"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
