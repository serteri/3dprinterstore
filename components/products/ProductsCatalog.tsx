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
  categoryCounts: Record<string, number>;
};

const TAXONOMY = [
  "Architectural & Design",
  "Tech & Workspace",
  "Outdoor & Adventure",
  "Toys & Pop Culture",
  "Functional Engineering",
  "Art & Sculptures",
  "Home Hardware",
  "Education & Science",
  "Prototyping Services",
  "Bespoke / Custom",
] as const;

type TaxonomyCategory = (typeof TAXONOMY)[number];
type SelectedCategory = "All" | TaxonomyCategory;
type SortOption = "newest" | "price-asc";

export default function ProductsCatalog({ products, categoryCounts }: ProductsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const visibleProducts = useMemo(() => {
    const filtered =
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.categoryName === selectedCategory);

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, sortBy]);

  const totalCount =
    selectedCategory === "All"
      ? products.length
      : (categoryCounts[selectedCategory] ?? 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="h-fit rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Refine Collection</p>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">Categories</h2>
          <div className="mt-3 space-y-1.5">
            {/* All */}
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === "All"
                  ? "border-zinc-400 bg-zinc-950 text-zinc-100"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span>All Products</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  selectedCategory === "All"
                    ? "bg-zinc-700 text-zinc-200"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {products.length}
              </span>
            </button>

            {TAXONOMY.map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              const active = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-zinc-400 bg-zinc-950 text-zinc-100"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      active ? "bg-zinc-700 text-zinc-200" : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-800 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">Sort by</h2>
          <div className="mt-3 space-y-1.5">
            {(
              [
                { value: "newest", label: "Newest" },
                { value: "price-asc", label: "Price: Low to High" },
              ] as { value: SortOption; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSortBy(value)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  sortBy === value
                    ? "border-zinc-400 bg-zinc-950 text-zinc-100"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div>
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3">
          <p className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-100">{totalCount}</span>{" "}
            {totalCount === 1 ? "product" : "products"}
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            {selectedCategory === "All" ? "All Categories" : selectedCategory}
          </p>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-20 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">Empty Category</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">No products yet</h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Looking for something specific in this category? We can design and print it for you.
            </p>
            <a
              href="/custom"
              className="mt-6 inline-block rounded-lg border border-zinc-600 px-6 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-400 hover:bg-zinc-900/80 hover:text-white"
            >
              Explore Custom Projects
            </a>
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
