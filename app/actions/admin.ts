"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { UTApi } from "uploadthing/server";

import { requireAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type CarrierKey = "australia-post" | "dhl" | "fedex" | "ups" | "usps";

const CARRIER_TRACKING_LINKS: Record<CarrierKey, (trackingNumber: string) => string> = {
  "australia-post": (trackingNumber) =>
    `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trackingNumber)}`,
  dhl: (trackingNumber) =>
    `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`,
  fedex: (trackingNumber) =>
    `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`,
  ups: (trackingNumber) =>
    `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`,
  usps: (trackingNumber) =>
    `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`,
};

function getTrackingLink(carrier: string, trackingNumber: string) {
  const normalized = carrier.trim().toLowerCase().replace(/\s+/g, "-");
  const builder = CARRIER_TRACKING_LINKS[normalized as CarrierKey];

  if (builder) {
    return builder(trackingNumber);
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} tracking ${trackingNumber}`)}`;
}

function buildShippedEmailHtml({
  customerName,
  trackingNumber,
  trackingLink,
}: {
  customerName: string;
  trackingNumber: string;
  trackingLink: string;
}) {
  return `
  <div style="background:#070707;padding:32px 14px;font-family:Segoe UI,Arial,sans-serif;color:#f5f5f5;">
    <div style="max-width:560px;margin:0 auto;background:#0f0f0f;border:1px solid #222;border-radius:18px;padding:28px;">
      <p style="margin:0;color:#a3a3a3;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">Pera Dynamics</p>
      <h1 style="margin:16px 0 10px;font-size:30px;line-height:1.2;font-weight:600;">Your order is on the way</h1>
      <p style="margin:0 0 18px;color:#d4d4d4;font-size:15px;line-height:1.7;">Hi ${customerName}, your Pera Dynamics order is on the way! Tracking: <strong>${trackingNumber}</strong>.</p>
      <a href="${trackingLink}" style="display:inline-block;background:#f4f4f5;color:#111;padding:10px 16px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:600;">Track your shipment</a>
      <p style="margin:20px 0 0;color:#8a8a8a;font-size:12px;line-height:1.7;">If the button does not work, open this link:<br><a href="${trackingLink}" style="color:#bdbdbd;word-break:break-all;">${trackingLink}</a></p>
    </div>
  </div>`;
}

type ProductPayload = {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  inventory: number;
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

  if (!Number.isInteger(payload.inventory) || payload.inventory < 0) {
    throw new Error("Inventory must be a non-negative whole number.");
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
    inventory: payload.inventory,
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
      inventory: data.inventory,
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
  revalidatePath("/products");
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
      inventory: data.inventory,
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
  revalidatePath("/products");
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
  revalidatePath("/products");
}

export async function updateProductInventory(productId: string, inventory: number) {
  await requireAdminSession();

  if (!productId) {
    throw new Error("Product id is required.");
  }

  if (!Number.isInteger(inventory) || inventory < 0) {
    throw new Error("Inventory must be a non-negative whole number.");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { inventory },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
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

export async function getOrders() {
  await requireAdminSession();

  const orders = await prisma.order.findMany({
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));
}

export async function fulfillOrder(orderId: string, trackingNumber: string, carrier: string) {
  await requireAdminSession();

  if (!orderId) {
    throw new Error("Order id is required.");
  }

  const normalizedTracking = trackingNumber.trim();
  const normalizedCarrier = carrier.trim();

  if (!normalizedTracking) {
    throw new Error("Tracking number is required.");
  }

  if (!normalizedCarrier) {
    throw new Error("Carrier is required.");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: normalizedTracking,
      carrier: normalizedCarrier,
      status: "SHIPPED",
    },
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
    },
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Pera Dynamics <onboarding@resend.dev>";
  const trackingLink = getTrackingLink(normalizedCarrier, normalizedTracking);
  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: resendFromEmail,
    to: order.customerEmail,
    subject: "Your Pera Dynamics order is on the way",
    html: buildShippedEmailHtml({
      customerName: order.customerName,
      trackingNumber: normalizedTracking,
      trackingLink,
    }),
  });

  revalidatePath("/admin/orders");
}
