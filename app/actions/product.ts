"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function createUniqueSlug(title: string) {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const exists = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!exists) return candidate;

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

export async function createProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!title) {
    throw new Error("Product title is required.");
  }

  const price = Number(priceRaw);
  if (Number.isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  if (!imageUrl) {
    throw new Error("Please upload a product image.");
  }

  const slug = await createUniqueSlug(title);

  await prisma.product.create({
    data: {
      title,
      slug,
      price: price.toFixed(2),
      imageUrl,
      inventory: 0,
      isCustomizable: false,
    },
  });

  redirect("/");
}
