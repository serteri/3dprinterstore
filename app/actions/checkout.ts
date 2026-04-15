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

export async function createCheckoutSession(
  productId: string,
  clientPrice: number,
  clientTitle: string,
  _formData: FormData,
) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
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

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "always",
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["AU"],
    },
    phone_number_collection: {
      enabled: true,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 1200,
            currency: "aud",
          },
          display_name: "Standard Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 6 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 2500,
            currency: "aud",
          },
          display_name: "Express Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ],
    line_items: [
      {
        quantity: 1,
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
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  });

  if (!session.url) {
    throw new Error("Unable to create checkout session.");
  }

  redirect(session.url);
}
