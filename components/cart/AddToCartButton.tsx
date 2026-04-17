"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";

type AddToCartButtonProps = {
  product: {
    id: string;
    title: string;
    price: number;
    image?: string;
    inventory: number;
  };
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const outOfStock = product.inventory <= 0;

  function handleClick() {
    if (outOfStock) {
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      inventory: product.inventory,
      quantity: 1,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={handleClick}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
    >
      <ShoppingCart size={15} />
      {outOfStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
