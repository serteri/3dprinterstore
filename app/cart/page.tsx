"use client";

import Link from "next/link";

import { createCartStripeCheckoutSession } from "@/app/actions/stripe";
import { useCart } from "@/components/cart/CartProvider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

const FREE_SHIPPING_THRESHOLD_AUD = 80;
const STANDARD_SHIPPING_AUD = 10;

function serializeCartItems(items: Array<{ id: string; quantity: number }>) {
  return JSON.stringify(
    items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    })),
  );
}

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, setQuantity, clearCart } = useCart();
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_AUD - subtotal);
  const qualifiesForFreeShipping = remainingForFreeShipping === 0;
  const shippingCost = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_AUD;
  const totalAmount = subtotal + shippingCost;
  const cartItemsPayload = serializeCartItems(items);

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Your Basket</p>
            <h1 className="mt-1 text-3xl font-semibold text-zinc-100">Shopping Cart</h1>
            <p className="mt-2 text-sm text-zinc-400">{itemCount} item(s) saved locally in your browser.</p>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Clear Cart
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-12 text-center">
            <h2 className="text-xl font-medium text-zinc-100">Your cart is empty</h2>
            <p className="mt-2 text-zinc-400">Add products and they will remain here even if you close the page.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-medium text-zinc-100">{item.title}</h2>
                      <p className="mt-1 text-sm text-zinc-400">{formatCurrency(item.price)} each</p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-9 w-9 text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
                            aria-label={`Decrease quantity for ${item.title}`}
                          >
                            -
                          </button>
                          <span className="inline-flex h-9 min-w-10 items-center justify-center border-x border-zinc-700 px-2 text-sm font-semibold text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={item.inventory !== undefined ? item.quantity >= item.inventory : false}
                            className="h-9 w-9 text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
                            aria-label={`Increase quantity for ${item.title}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-300 transition-colors hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
              <h3 className="text-lg font-medium text-zinc-100">Order Summary</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-zinc-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-zinc-300">
                <span>Shipping</span>
                <span>{qualifiesForFreeShipping ? "FREE" : "Standard - A$10"}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-sm font-semibold text-zinc-100">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <p className="mt-3 rounded-lg border border-amber-700/60 bg-amber-950/25 px-3 py-2 text-sm text-amber-200">
                {qualifiesForFreeShipping
                  ? "Your order qualifies for FREE Standard Shipping!"
                  : `Add ${formatCurrency(remainingForFreeShipping)} more to get Free Shipping!`}
              </p>

              <form action={createCartStripeCheckoutSession} className="mt-4">
                <input type="hidden" name="cartItems" value={cartItemsPayload} />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-600 bg-zinc-950 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-900"
                >
                  Proceed to Checkout
                </button>
              </form>

              <p className="mt-4 text-xs text-zinc-500">Taxes are calculated at checkout.</p>
              <Link
                href="/products"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-cyan-500/60 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
