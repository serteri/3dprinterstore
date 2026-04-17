"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const CART_STORAGE_KEY = "print3d-cart-v1";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  inventory?: number;
  quantity: number;
};

type AddCartItemInput = {
  id: string;
  title: string;
  price: number;
  image?: string;
  inventory?: number;
  quantity?: number;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  const result: CartItem[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Partial<CartItem>;
    if (!candidate.id || !candidate.title || !Number.isFinite(candidate.price)) {
      continue;
    }

    const quantity = Number.isFinite(candidate.quantity) ? Math.max(1, Math.trunc(candidate.quantity as number)) : 1;
    const inventory = Number.isFinite(candidate.inventory)
      ? Math.max(0, Math.trunc(candidate.inventory as number))
      : undefined;

    if (inventory === 0) {
      continue;
    }

    const clampedQuantity = inventory !== undefined ? Math.min(quantity, inventory) : quantity;

    result.push({
      id: String(candidate.id),
      title: String(candidate.title),
      price: Number(candidate.price),
      image: candidate.image ? String(candidate.image) : undefined,
      inventory,
      quantity: clampedQuantity,
    });
  }

  return result;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        setItems(sanitizeItems(JSON.parse(raw)));
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextType>(() => {
    const addItem = (input: AddCartItemInput) => {
      const requestedQuantity = Math.max(1, Math.trunc(input.quantity ?? 1));
      const maxQty = Number.isFinite(input.inventory)
        ? Math.max(0, Math.trunc(input.inventory as number))
        : undefined;

      if (maxQty === 0) {
        return;
      }

      setItems((prev) => {
        const existing = prev.find((item) => item.id === input.id);

        if (existing) {
          const nextQtyBase = existing.quantity + requestedQuantity;
          const nextQty = maxQty !== undefined ? Math.min(nextQtyBase, maxQty) : nextQtyBase;
          return prev.map((item) =>
            item.id === input.id
              ? {
                  ...item,
                  price: input.price,
                  image: input.image,
                  inventory: maxQty,
                  quantity: nextQty,
                }
              : item,
          );
        }

        const quantity = maxQty !== undefined ? Math.min(requestedQuantity, maxQty) : requestedQuantity;

        return [
          ...prev,
          {
            id: input.id,
            title: input.title,
            price: input.price,
            image: input.image,
            inventory: maxQty,
            quantity,
          },
        ];
      });
    };

    const removeItem = (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const setQuantity = (id: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((item) => {
            if (item.id !== id) return item;

            const maxQty = item.inventory;
            const next = Math.max(1, Math.trunc(quantity));
            const clamped = maxQty !== undefined ? Math.min(next, maxQty) : next;

            return {
              ...item,
              quantity: clamped,
            };
          })
          .filter((item) => item.quantity > 0),
      );
    };

    const clearCart = () => {
      setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
