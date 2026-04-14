"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { createProduct } from "@/app/actions/product";
import ImageUpload from "@/components/ui/ImageUpload";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Product"}
    </button>
  );
}

export default function AddProductPage() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)] sm:p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Add Product</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create a new catalog item for your 3D printing boutique.
          </p>
        </div>

        <form action={createProduct} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-200">
              Product Title
            </label>
            <input
              id="title"
              name="title"
              placeholder="Mushroom Kingdom Villain"
              required
              className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-zinc-200">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="49.99"
              required
              className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-200">Product Image</p>
            <ImageUpload onUploadComplete={setImageUrl} />
            <p className="text-xs text-zinc-500">
              {imageUrl ? "Image uploaded and ready." : "Upload one product image before saving."}
            </p>
          </div>

          <input type="hidden" name="imageUrl" value={imageUrl} readOnly />

          <div className="flex items-center justify-end border-t border-zinc-800 pt-6">
            <SaveButton />
          </div>
        </form>
      </div>
    </section>
  );
}
