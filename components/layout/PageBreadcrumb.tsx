"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segmentLabelMap: Record<string, string> = {
  admin: "Admin",
  add: "Add",
  "add-product": "Add Product",
  products: "Products",
  about: "About",
  custom: "Custom",
  cart: "Cart",
  cancel: "Cancel",
  success: "Success",
  login: "Login",
  orders: "Orders",
};

function toLabel(segment: string) {
  if (segmentLabelMap[segment]) {
    return segmentLabelMap[segment];
  }

  if (segment.length <= 4 && /^[a-z0-9]+$/i.test(segment)) {
    return "Detail";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PageBreadcrumb() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  if (pathname.startsWith("/api")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-zinc-900 bg-[linear-gradient(90deg,rgba(24,24,27,0.78)_0%,rgba(39,39,42,0.18)_50%,rgba(24,24,27,0.78)_100%)]">
      <div className="mx-auto flex h-11 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs tracking-[0.08em] text-zinc-500">
          <Link href="/" className="rounded-sm px-1 py-0.5 transition-colors hover:text-zinc-200">
            Home
          </Link>
          {segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const isLast = index === segments.length - 1;

            return (
              <span key={href} className="flex min-w-0 items-center gap-2">
                <span className="text-zinc-700">/</span>
                {isLast ? (
                  <span className="truncate text-zinc-300">{toLabel(segment)}</span>
                ) : (
                  <Link href={href} className="truncate rounded-sm px-1 py-0.5 transition-colors hover:text-zinc-200">
                    {toLabel(segment)}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
