import Link from "next/link";
import { notFound } from "next/navigation";

import { createStripeCheckoutSession } from "@/app/actions/stripe";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function formatUsdEstimateFromAud(audValue: number) {
  const usdEstimate = audValue * 0.65;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usdEstimate);
}

function formatAfterpayInstallment(audValue: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
  }).format(audValue / 4);
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

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Price (AUD)</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-400">{formatCurrency(Number(product.price))}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-zinc-950">a</span>
                <span>or 4 interest-free payments of {formatAfterpayInstallment(Number(product.price))} with Afterpay</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Approx. {formatUsdEstimateFromAud(Number(product.price))} USD. Checkout is charged in AUD. Stripe may show localized prices where Adaptive Pricing is available.
              </p>
            </div>

            <form action={checkoutAction} className="mt-6">
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                disabled={product.inventory <= 0}
                className="inline-flex w-full items-center justify-center rounded-xl border border-amber-500/50 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-300 shadow-[0_14px_30px_rgba(0,0,0,0.45)] transition-all hover:border-amber-300/80 hover:text-amber-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500 disabled:hover:border-zinc-700 disabled:hover:text-zinc-500"
              >
                {product.inventory <= 0 ? "Out of Stock" : "Buy Now (Pay in AUD)"}
              </button>
            </form>

            <AddToCartButton
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
                All orders are packed and dispatched from our Brisbane workshop. Standard shipping generally arrives in 3-6 business days across Australia, while Express shipping typically arrives within 1-2 business days after dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
