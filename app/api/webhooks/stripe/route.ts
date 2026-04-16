import Stripe from "stripe";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = event.data.object;
  const productId = session.metadata?.productId;
  const quantityRaw = session.metadata?.quantity ?? "1";
  const quantity = Math.max(1, Number.parseInt(quantityRaw, 10) || 1);

  if (!productId) {
    return;
  }

  await prisma.product.updateMany({
    where: {
      id: productId,
      inventory: {
        gte: quantity,
      },
    },
    data: {
      inventory: {
        decrement: quantity,
      },
    },
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
