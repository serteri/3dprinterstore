"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Layers } from "lucide-react";
import { useState, useEffect } from "react";

import { useCart } from "@/components/cart/CartProvider";

const desktopLinks = [
  { href: "/products", label: "Products" },
  { href: "/custom", label: "Custom Projects" },
  { href: "/about", label: "About Us" },
];

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/custom", label: "Custom Projects" },
  { href: "/about", label: "About Us" },
];

type NavbarProps = {
  isAdminAuthenticated?: boolean;
};

export default function Navbar({ isAdminAuthenticated = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  // Force-close mobile menu whenever the viewport reaches desktop width
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[68px] sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <Layers
              className="shrink-0 text-zinc-300 transition-transform duration-300 group-hover:rotate-12"
              size={20}
              strokeWidth={1.5}
            />
            <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-zinc-100 sm:text-[14px]">
              Pera Dynamics
            </span>
          </Link>

          {/* ── Desktop Navigation (md and up) ── */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium tracking-wide text-zinc-400 transition-opacity duration-150 hover:opacity-100 hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
            {isAdminAuthenticated && (
              <Link
                href="/admin/products"
                className="text-[13px] font-medium tracking-wide text-zinc-600 transition-colors hover:text-zinc-400"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-3">

            {/* Cart icon — badge only when cart has items */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center rounded-full p-2 text-zinc-400 transition-colors hover:text-zinc-100"
              aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zinc-100 px-1 text-[9px] font-bold leading-none text-zinc-950">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile only. Hidden via Tailwind AND !important CSS rule targeting [data-hamburger] */}
            <button
              type="button"
              data-hamburger
              className="flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-100 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Fullscreen Overlay (below md only) ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Overlay header row */}
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5 sm:h-[68px]">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <Layers size={20} strokeWidth={1.5} className="text-zinc-300" />
              <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-zinc-100">
                Pera Dynamics
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-100"
              aria-label="Close menu"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col justify-center px-8" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {mobileLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-4 text-xl font-medium text-zinc-200 transition-colors hover:bg-zinc-900 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAdminAuthenticated && (
                <li>
                  <Link
                    href="/admin/products"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-4 text-xl font-medium text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Bottom hint */}
          <div className="border-t border-zinc-900 px-8 py-6">
            <p className="text-xs tracking-[0.18em] text-zinc-600 uppercase">Pera Dynamics — Brisbane</p>
          </div>
        </div>
      )}
    </>
  );
}
