"use client";

import { useMemo, useState } from "react";

import AddToCartButton from "@/components/cart/AddToCartButton";

const FREE_SHIPPING_THRESHOLD_AUD = 80;

type ProductPurchasePanelProps = {
  product: {
    id: string;
    title: string;
    price: number;
    image?: string;
    inventory: number;
  };
  checkoutAction: (formData: FormData) => Promise<void>;
};

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

export default function ProductPurchasePanel({ product, checkoutAction }: ProductPurchasePanelProps) {
  const isInStock = product.inventory > 0;
  const maxQuantity = Math.max(1, product.inventory);
  const [quantity, setQuantity] = useState(1);

  const orderTotal = useMemo(() => product.price * quantity, [product.price, quantity]);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_AUD - orderTotal);
  const qualifiesForFreeShipping = remainingForFreeShipping === 0;

  function decreaseQuantity() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function increaseQuantity() {
    if (!isInStock) return;
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  }

  return (
    <>
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Price (AUD)</p>
        <p className="mt-1 text-2xl font-semibold text-cyan-400">{formatCurrency(product.price)}</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-zinc-950">a</span>
          <span>or 4 interest-free payments of {formatAfterpayInstallment(product.price)} with Afterpay</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Approx. {formatUsdEstimateFromAud(product.price)} USD. Checkout is charged in AUD. Stripe may show localized prices where Adaptive Pricing is available.
        </p>
        {isInStock ? (
          <p className="mt-3 rounded-lg border border-amber-700/60 bg-amber-950/25 px-3 py-2 text-sm text-amber-200">
            {qualifiesForFreeShipping
              ? "Your order qualifies for FREE Standard Shipping!"
              : `Add ${formatCurrency(remainingForFreeShipping)} more to get Free Shipping!`}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm">
        <span className="text-zinc-400">Quantity</span>
        <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={!isInStock || quantity <= 1}
            className="h-8 w-8 text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="inline-flex h-8 min-w-10 items-center justify-center border-x border-zinc-700 px-2 font-semibold text-zinc-100">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increaseQuantity}
            disabled={!isInStock || quantity >= maxQuantity}
            className="h-8 w-8 text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-2 text-right text-sm text-zinc-300">
        Total: <span className="font-semibold text-zinc-100">{formatCurrency(orderTotal)}</span>
      </div>

      <form action={checkoutAction} className="mt-4">
        <input type="hidden" name="quantity" value={String(quantity)} />
        <button
          type="submit"
          disabled={!isInStock}
          className="inline-flex w-full items-center justify-center rounded-xl border border-amber-500/50 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-300 shadow-[0_14px_30px_rgba(0,0,0,0.45)] transition-all hover:border-amber-300/80 hover:text-amber-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500 disabled:hover:border-zinc-700 disabled:hover:text-zinc-500"
        >
          {!isInStock ? "Out of Stock" : `Buy Now (${formatCurrency(orderTotal)})`}
        </button>
      </form>

      <AddToCartButton
        product={product}
        quantity={quantity}
      />
    </>
  );
}
