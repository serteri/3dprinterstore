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

export async function createStripeCheckoutSession(
  productId: string,
  formData: FormData,
) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }

  const standardShippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_STANDARD_RATE_ID || process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ID;
  const expressShippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_EXPRESS_RATE_ID;
  const freeShippingRateId = process.env.NEXT_PUBLIC_STRIPE_SHIPPING_FREE_RATE_ID;

  if (!standardShippingRateId || !expressShippingRateId || !freeShippingRateId) {
    throw new Error(
      "Shipping rates are not fully configured. Please set NEXT_PUBLIC_STRIPE_SHIPPING_STANDARD_RATE_ID (or NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ID), NEXT_PUBLIC_STRIPE_SHIPPING_EXPRESS_RATE_ID, and NEXT_PUBLIC_STRIPE_SHIPPING_FREE_RATE_ID.",
    );
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
  const FREE_SHIPPING_THRESHOLD_CENTS = 10000;
  const hasFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingOptions = hasFreeShipping
    ? [
        // Put free shipping first so it is selected by default in Stripe Checkout.
        { shipping_rate: freeShippingRateId },
        { shipping_rate: expressShippingRateId },
      ]
    : [
        { shipping_rate: standardShippingRateId },
        { shipping_rate: expressShippingRateId },
      ];

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
