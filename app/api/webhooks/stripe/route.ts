import Stripe from "stripe";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = event.data.object;

  if (session.payment_status !== "paid") {
    return;
  }

  const sessionId = session.id;
  const productId = session.metadata?.productId;
  const quantityRaw = session.metadata?.quantity ?? "1";
  const quantity = Math.max(1, Number.parseInt(quantityRaw, 10) || 1);
  const customerName = session.customer_details?.name?.trim() || "Customer";
  const customerEmail = session.customer_details?.email?.trim() || "no-email@unknown.local";

  const activeAddress = session.customer_details?.address;
  const shippingAddress = activeAddress
    ? [
        activeAddress.line1,
        activeAddress.line2,
        activeAddress.city,
        activeAddress.state,
        activeAddress.postal_code,
        activeAddress.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "Address not provided";

  const totalAmount = Number(((session.amount_total ?? 0) / 100).toFixed(2));

  if (!productId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true },
    });

    if (existingOrder) {
      return;
    }

    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, inventory: true },
    });

    if (!product) {
      return;
    }

    if (product.inventory < quantity) {
      return;
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        inventory: {
          decrement: quantity,
        },
      },
    });

    await tx.order.create({
      data: {
        stripeSessionId: sessionId,
        customerName,
        customerEmail,
        shippingAddress,
        totalAmount: totalAmount.toFixed(2),
        status: "PENDING",
        orderItems: {
          create: [
            {
              productId,
              quantity,
              price: Number(product.price).toFixed(2),
            },
          ],
        },
      },
    });
  });
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await req.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event as Stripe.CheckoutSessionCompletedEvent);
  }

  return NextResponse.json({ received: true });
}
