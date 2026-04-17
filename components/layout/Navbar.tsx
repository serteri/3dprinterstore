"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Layers } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/custom", label: "Custom Order" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Layers
            className="text-cyan-400 transition-transform group-hover:rotate-12"
            size={24}
            strokeWidth={1.5}
          />
          <span className="text-lg font-bold tracking-tight text-white">
            PRINT<span className="text-cyan-400">3D</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full p-2 text-zinc-400 transition-colors hover:text-white"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={22} strokeWidth={1.5} />
            {/* Cart count badge */}
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-zinc-950">
              {itemCount}
            </span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:text-white md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-zinc-950 md:hidden">
          <ul className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
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
