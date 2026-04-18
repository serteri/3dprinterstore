import ProductsCatalog from "@/components/products/ProductsCatalog";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const categoryCounts: Record<string, number> = {};
  for (const cat of categories) {
    categoryCounts[cat.name] = cat._count.products;
  }

  return (
    <section className="min-h-screen bg-zinc-950 pb-16 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Pera Dynamics</p>
          <h1 className="mt-2 text-4xl font-bold text-white">All Products</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Browse our current catalog of precision 3D printed products available for direct order.
          </p>
        </div>

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
          categoryCounts={categoryCounts}
        />
      </div>
    </section>
  );
}
