import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";

import SuccessConfetti from "@/app/success/SuccessConfetti";
import { getSiteUrl } from "@/lib/site-url";

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = getSiteUrl();

  if (!sessionId || !secretKey) {
    redirect("/cancel");
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    redirect("/cancel");
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#1b1b1b_0%,_#0a0a0a_45%,_#030303_100%)] px-4 py-16">
      <SuccessConfetti />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.04)_100%)]" />
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-700/60 bg-black/70 p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Payment Complete</p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-100">Order Successful!</h1>
        <p className="mx-auto mt-5 max-w-xl text-zinc-300">
          Your order is being prepared. Tracking info will be sent via email.
        </p>

        <div className="mt-10">
          <Link
            href={`${siteUrl}/products`}
            className="inline-flex items-center justify-center rounded-full border border-zinc-500 bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100 transition-colors hover:border-zinc-300 hover:bg-zinc-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
