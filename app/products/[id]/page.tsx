import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <section className="min-h-screen bg-zinc-950 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
        >
          Back to Products
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-zinc-500">No image available</div>
              )}
            </div>

            {product.images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(1).map((imageUrl) => (
                  <div key={imageUrl} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                    <img src={imageUrl} alt={`${product.title} preview`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{product.category.name}</p>
            <h1 className="mt-3 text-3xl font-bold text-white">{product.title}</h1>
            <p className="mt-4 text-zinc-300">{product.description}</p>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Price</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-400">{formatCurrency(Number(product.price))}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
