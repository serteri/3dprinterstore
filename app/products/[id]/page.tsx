import Link from "next/link";
import { notFound } from "next/navigation";

import { createStripeCheckoutSession } from "@/app/actions/stripe";
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel";
import { prisma } from "@/lib/prisma";

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

  const checkoutAction = createStripeCheckoutSession.bind(null, product.id);

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

            <ProductPurchasePanel
              checkoutAction={checkoutAction}
              product={{
                id: product.id,
                title: product.title,
                price: Number(product.price),
                image: product.images[0],
                inventory: product.inventory,
              }}
            />

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Shipping Information</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                FREE Standard Shipping on orders over A$100. Dispatched from Brisbane via Australia Post.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
