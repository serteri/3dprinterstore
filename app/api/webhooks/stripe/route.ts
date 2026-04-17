import Stripe from "stripe";
import { NextResponse } from "next/server";

import { sendTransactionalEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function buildOrderSuccessEmailHtml({
  customerName,
  totalAmount,
}: {
  customerName: string;
  totalAmount: number;
}) {
  return `
  <div style="background:#070707;padding:32px 14px;font-family:Segoe UI,Arial,sans-serif;color:#f5f5f5;">
    <div style="max-width:560px;margin:0 auto;background:#0f0f0f;border:1px solid #222;border-radius:18px;padding:28px;">
      <p style="margin:0;color:#a3a3a3;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">Pera Dynamics</p>
      <h1 style="margin:16px 0 10px;font-size:30px;line-height:1.2;font-weight:600;">Order confirmed</h1>
      <p style="margin:0;color:#d4d4d4;font-size:15px;line-height:1.7;">Hi ${customerName}, thanks for your order. We have received your payment successfully.</p>
      <p style="margin:14px 0 0;color:#d4d4d4;font-size:15px;line-height:1.7;">Order total: <strong>A$${totalAmount.toFixed(2)}</strong></p>
      <p style="margin:14px 0 0;color:#8a8a8a;font-size:12px;line-height:1.7;">We will email your tracking details as soon as the parcel leaves our Brisbane workshop.</p>
    </div>
  </div>`;
}

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

  const emailPayload = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true },
    });

    if (existingOrder) {
      return null;
    }

    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, inventory: true },
    });

    if (!product) {
      return null;
    }

    if (product.inventory < quantity) {
      return null;
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

    return {
      customerName,
      customerEmail,
      totalAmount,
    };
  });

  if (!emailPayload) {
    return;
  }

  await sendTransactionalEmail(
    {
      tag: "order-success",
      toEmail: emailPayload.customerEmail,
      toName: emailPayload.customerName,
      subject: "Your Pera Dynamics order is confirmed",
      html: buildOrderSuccessEmailHtml({
        customerName: emailPayload.customerName,
        totalAmount: emailPayload.totalAmount,
      }),
      text: `Hi ${emailPayload.customerName}, thanks for your order. Payment received. Order total: A$${emailPayload.totalAmount.toFixed(2)}. We will send tracking details once your parcel is dispatched.`,
    },
    { throwOnError: false },
  );
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
