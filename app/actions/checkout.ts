"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

const GLOBAL_SHIPPING_COUNTRIES = [
  "AU", "NZ", "US", "CA", "GB", "IE", "DE", "FR", "IT", "ES", "NL", "BE", "CH", "AT", "SE",
  "NO", "DK", "FI", "PT", "PL", "CZ", "HU", "RO", "BG", "HR", "GR", "CY", "MT", "EE", "LV",
  "LT", "SK", "SI", "LU", "AE", "SA", "QA", "KW", "BH", "SG", "MY", "JP", "KR", "HK", "TW",
  "TH", "PH", "ID", "VN", "IN", "ZA", "BR", "MX", "CL", "AR", "CO", "PE",
] as const;

export async function createCheckoutSession(
  productId: string,
  clientPrice: number,
  clientTitle: string,
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

  if (Math.abs(productPrice - clientPrice) > 0.009 || product.title !== clientTitle) {
    throw new Error("Product data mismatch. Please refresh and try again.");
  }

  const unitAmountCents = Math.round(productPrice * 100);
  const subtotalCents = unitAmountCents;
  const FREE_SHIPPING_THRESHOLD_CENTS = 10000;
  const hasFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingOptions = hasFreeShipping
    ? [
        { shipping_rate: freeShippingRateId },
        { shipping_rate: expressShippingRateId },
      ]
    : [
        { shipping_rate: standardShippingRateId },
        { shipping_rate: expressShippingRateId },
      ];

  const baseUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "always",
    automatic_tax: {
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
        quantity: 1,
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
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  });

  if (!session.url) {
    throw new Error("Unable to create checkout session.");
  }

  redirect(session.url);
}
