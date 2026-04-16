import Link from "next/link";

export default function CancelPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900/70 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Payment Interrupted</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-100">Checkout canceled</h1>
        <p className="mt-4 text-zinc-300">No charge was made. You can continue shopping and retry checkout anytime.</p>

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full border border-zinc-500 px-6 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-300 hover:bg-zinc-800"
          >
            Return to Products
          </Link>
        </div>
      </div>
    </section>
  );
}
