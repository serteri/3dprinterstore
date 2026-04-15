"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

import { requireAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type ProductPayload = {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
};

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

function extractUploadThingKey(url: string) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const fIndex = segments.indexOf("f");

    if (fIndex !== -1 && segments[fIndex + 1]) {
      return segments[fIndex + 1];
    }

    return segments.at(-1) ?? null;
  } catch {
    return null;
  }
}

async function deleteUploadThingFiles(urls: string[]) {
  if (urls.length === 0) return;

  const keys = urls
    .map(extractUploadThingKey)
    .filter((key): key is string => Boolean(key));

  if (keys.length === 0) return;

  const utapi = new UTApi();
  await utapi.deleteFiles(keys);
}

function validateProductPayload(payload: ProductPayload) {
  const title = payload.title.trim();
  const description = payload.description.trim();
  const uniqueImages = Array.from(new Set(payload.images.map((image) => image.trim()).filter(Boolean)));

  if (!title) {
    throw new Error("Product title is required.");
  }

  if (!description) {
    throw new Error("Product description is required.");
  }

  if (!payload.categoryId) {
    throw new Error("Category is required.");
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  if (uniqueImages.length === 0) {
    throw new Error("At least one product image is required.");
  }

  return {
    title,
    description,
    categoryId: payload.categoryId,
    price: Number(payload.price.toFixed(2)),
    images: uniqueImages,
  };
}

export async function createCategory(name: string) {
  await requireAdminSession();

  const categoryName = name.trim();

  if (!categoryName) {
    throw new Error("Category name is required.");
  }

  const category = await prisma.category.create({
    data: { name: categoryName },
    select: { id: true, name: true },
  });

  revalidatePath("/admin/products");
  return category;
}

export async function getCategories() {
  await requireAdminSession();

  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createProduct(payload: ProductPayload) {
  await requireAdminSession();

  const data = validateProductPayload(payload);
  const slug = await createUniqueSlug(data.title);

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      price: data.price.toFixed(2),
      categoryId: data.categoryId,
      images: data.images,
      inventory: 0,
      isCustomizable: false,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  return {
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
  };
}

export async function updateProduct(productId: string, payload: ProductPayload) {
  await requireAdminSession();

  if (!productId) {
    throw new Error("Product id is required.");
  }

  const data = validateProductPayload(payload);

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { images: true },
  });

  if (!existing) {
    throw new Error("Product not found.");
  }

  const removedImages = existing.images.filter((image) => !data.images.includes(image));

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      title: data.title,
      description: data.description,
      price: data.price.toFixed(2),
      categoryId: data.categoryId,
      images: data.images,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (removedImages.length > 0) {
    await deleteUploadThingFiles(removedImages);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return {
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
  };
}

export async function deleteProduct(productId: string) {
  await requireAdminSession();

  if (!productId) {
    throw new Error("Product id is required.");
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, images: true },
  });

  if (!existing) {
    throw new Error("Product not found.");
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  if (existing.images.length > 0) {
    await deleteUploadThingFiles(existing.images);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function getProducts(categoryId?: string) {
  await requireAdminSession();

  const products = await prisma.product.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
  }));
}
