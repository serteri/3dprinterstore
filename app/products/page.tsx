import Link from "next/link";

import ProductsCatalog from "@/components/products/ProductsCatalog";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Pera Dynamics</p>
            <h1 className="mt-2 text-4xl font-bold text-white">All Products</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Browse our current catalog of precision 3D printed products available for direct order.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
          >
            Back to Home
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-white">Our collection is coming soon</h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              We are preparing the catalog right now. New models and exclusive launches will appear here soon.
            </p>
          </div>
        ) : (
          <ProductsCatalog
            products={products.map((product) => ({
              id: product.id,
              title: product.title,
              description: product.description,
              price: Number(product.price),
              images: product.images,
              createdAt: product.createdAt.toISOString(),
              categoryName: product.category.name,
            }))}
          />
        )}
      </div>
    </section>
  );
}
