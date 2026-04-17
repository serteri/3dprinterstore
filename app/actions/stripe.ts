"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

const GLOBAL_SHIPPING_COUNTRIES = [
  "AU", "US", "GB", "CA", "NZ",
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

const FREE_SHIPPING_THRESHOLD_CENTS = 8000;

type StripeShippingRateConfig = {
  standardShippingRateId: string;
  expressShippingRateId: string;
  freeShippingRateId: string;
};

function getStripeShippingRateConfig(): StripeShippingRateConfig {
  const standardShippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_STANDARD_RATE_ID || process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ID;
  const expressShippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_EXPRESS_RATE_ID;
  const freeShippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_FREE_RATE_ID;

  if (!standardShippingRateId || !expressShippingRateId || !freeShippingRateId) {
    throw new Error(
      "Shipping rates are not fully configured. Please set NEXT_PUBLIC_STRIPE_SHIPPING_STANDARD_RATE_ID (or NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ID), NEXT_PUBLIC_STRIPE_SHIPPING_EXPRESS_RATE_ID, and NEXT_PUBLIC_STRIPE_SHIPPING_FREE_RATE_ID.",
    );
  }

  return {
    standardShippingRateId,
    expressShippingRateId,
    freeShippingRateId,
  };
}

function getShippingOptions(subtotalCents: number, config: StripeShippingRateConfig) {
  const hasFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;

  return hasFreeShipping
    ? [
        // Put standard-free first so Stripe pre-selects it by default.
        { shipping_rate: config.freeShippingRateId },
        { shipping_rate: config.expressShippingRateId },
      ]
    : [
        { shipping_rate: config.standardShippingRateId },
        { shipping_rate: config.expressShippingRateId },
      ];
}

type ParsedCartLine = {
  id: string;
  quantity: number;
};

function parseCartItemsInput(raw: FormDataEntryValue | null): ParsedCartLine[] {
  if (!raw || typeof raw !== "string") {
    throw new Error("Cart payload is missing.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid cart payload.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Cart is empty.");
  }

  const aggregate = new Map<string, number>();

  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as { id?: unknown; quantity?: unknown };
    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const quantityRaw = Number(candidate.quantity);
    const quantity = Math.max(1, Math.min(20, Number.isFinite(quantityRaw) ? Math.trunc(quantityRaw) : 1));

    if (!id) continue;

    aggregate.set(id, (aggregate.get(id) ?? 0) + quantity);
  }

  return Array.from(aggregate.entries()).map(([id, quantity]) => ({ id, quantity }));
}

function serializeCartItemsMetadata(lines: Array<{ productId: string; quantity: number }>) {
  return lines.map((line) => `${line.productId}:${line.quantity}`).join(",");
}

export async function createStripeCheckoutSession(
  productId: string,
  formData: FormData,
) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }

  const shippingRateConfig = getStripeShippingRateConfig();

  const quantityRaw = String(formData.get("quantity") ?? "1").trim();
  const quantity = Math.max(1, Math.min(20, Number(quantityRaw) || 1));

  const stripe = new Stripe(secretKey);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      images: true,
      inventory: true,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const productPrice = Number(product.price);
  if (!Number.isFinite(productPrice) || productPrice <= 0) {
    throw new Error("Invalid product price.");
  }

  if (product.inventory <= 0) {
    throw new Error("This product is currently out of stock.");
  }

  const finalQuantity = Math.min(quantity, product.inventory);
  const unitAmountCents = Math.round(productPrice * 100);
  const subtotalCents = unitAmountCents * finalQuantity;
  const shippingOptions = getShippingOptions(subtotalCents, shippingRateConfig);

  const baseUrl = getSiteUrl();

  const params = {
    mode: "payment",
    customer_creation: "always",
    automatic_tax: {
      enabled: true,
    },
    // If enabled in your Stripe account, checkout can present localized amounts automatically.
    adaptive_pricing: {
      enabled: true,
    },
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [...GLOBAL_SHIPPING_COUNTRIES],
    },
    phone_number_collection: {
      enabled: true,
    },
    shipping_options: shippingOptions,
    line_items: [
      {
        quantity: finalQuantity,
        price_data: {
          currency: "aud",
          unit_amount: unitAmountCents,
          product_data: {
            name: product.title,
            description: product.description,
            images: product.images.slice(0, 1),
          },
        },
      },
    ],
    metadata: {
      productId: product.id,
      quantity: String(finalQuantity),
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  };

  const session = await stripe.checkout.sessions.create(params as Stripe.Checkout.SessionCreateParams);

  if (!session.url) {
    throw new Error("Unable to create checkout session.");
  }

  redirect(session.url);
}

export async function createCartStripeCheckoutSession(formData: FormData) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }

  const shippingRateConfig = getStripeShippingRateConfig();
  const parsedLines = parseCartItemsInput(formData.get("cartItems"));

  if (parsedLines.length === 0) {
    throw new Error("Cart is empty.");
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: parsedLines.map((line) => line.id) },
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      images: true,
      inventory: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const lineItems: NonNullable<Stripe.Checkout.SessionCreateParams["line_items"]> = [];
  const metadataLines: Array<{ productId: string; quantity: number }> = [];
  let subtotalCents = 0;

  for (const line of parsedLines) {
    const product = productMap.get(line.id);
    if (!product) {
      throw new Error("One or more products are no longer available.");
    }

    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Invalid price for ${product.title}.`);
    }

    if (product.inventory <= 0) {
      throw new Error(`${product.title} is out of stock.`);
    }

    const finalQuantity = Math.min(line.quantity, product.inventory);
    const unitAmountCents = Math.round(price * 100);
    subtotalCents += unitAmountCents * finalQuantity;

    lineItems.push({
      quantity: finalQuantity,
      price_data: {
        currency: "aud",
        unit_amount: unitAmountCents,
        product_data: {
          name: product.title,
          description: product.description,
          images: product.images.slice(0, 1),
        },
      },
    });

    metadataLines.push({
      productId: product.id,
      quantity: finalQuantity,
    });
  }

  const shippingOptions = getShippingOptions(subtotalCents, shippingRateConfig);
  const stripe = new Stripe(secretKey);
  const baseUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "always",
    automatic_tax: {
      enabled: true,
    },
    adaptive_pricing: {
      enabled: true,
    },
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [...GLOBAL_SHIPPING_COUNTRIES],
    },
    phone_number_collection: {
      enabled: true,
    },
    shipping_options: shippingOptions,
    line_items: lineItems,
    metadata: {
      cartItems: serializeCartItemsMetadata(metadataLines),
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  });

  if (!session.url) {
    throw new Error("Unable to create checkout session.");
  }

  redirect(session.url);
}
