"use client";

import { useMemo, useState } from "react";

import ProductCard from "@/components/ui/ProductCard";

type ProductForCatalog = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  createdAt: string;
  categoryName: string;
};

type ProductsCatalogProps = {
  products: ProductForCatalog[];
};

const categoryFilters = [
  "All",
  "Home Decor",
  "Tech Accessories",
  "Engineering Parts",
] as const;

type CategoryFilter = (typeof categoryFilters)[number];
type SortOption = "newest" | "price-asc";

function normalizeCategoryName(rawCategory: string): Exclude<CategoryFilter, "All"> {
  const normalized = rawCategory.trim().toLowerCase();

  if (normalized === "home decor") {
    return "Home Decor";
  }

  if (normalized === "tech accessories") {
    return "Tech Accessories";
  }

  return "Engineering Parts";
}

export default function ProductsCatalog({ products }: ProductsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (selectedCategory === "All") {
        return true;
      }

      return normalizeCategoryName(product.categoryName) === selectedCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Refine Collection</p>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">Categories</h2>
          <div className="mt-3 space-y-2">
            {categoryFilters.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-zinc-400 bg-zinc-950 text-zinc-100"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-800 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">Sort by</h2>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setSortBy("price-asc")}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                sortBy === "price-asc"
                  ? "border-zinc-400 bg-zinc-950 text-zinc-100"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              Price (Low to High)
            </button>
            <button
              type="button"
              onClick={() => setSortBy("newest")}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                sortBy === "newest"
                  ? "border-zinc-400 bg-zinc-950 text-zinc-100"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              Newest
            </button>
          </div>
        </div>
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3">
          <p className="text-sm text-zinc-400">
            Showing <span className="font-medium text-zinc-100">{visibleProducts.length}</span> product(s)
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            {selectedCategory === "All" ? "All Categories" : selectedCategory}
          </p>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-white">No products for this filter yet</h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Try another category or sort option. New premium drops are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  description: product.description,
                  price: product.price,
                  images: product.images,
                  createdAt: product.createdAt,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
