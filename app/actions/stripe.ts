"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const GLOBAL_SHIPPING_COUNTRIES = [
  "AU", "US", "GB", "CA", "NZ",
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export async function createStripeCheckoutSession(
  productId: string,
  formData: FormData,
) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }

  const shippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ID;
  if (!shippingRateId) {
    throw new Error("Shipping rate is not configured. Please set NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ID.");
  }

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
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const productPrice = Number(product.price);
  if (!Number.isFinite(productPrice) || productPrice <= 0) {
    throw new Error("Invalid product price.");
  }

  const baseUrl = getBaseUrl();

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
    shipping_options: [
      {
        shipping_rate: shippingRateId,
      },
    ],
    line_items: [
      {
        quantity,
        price_data: {
          currency: "aud",
          unit_amount: Math.round(productPrice * 100),
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
      quantity: String(quantity),
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
