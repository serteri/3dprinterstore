import Link from "next/link";

export default function CancelPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-amber-800/70 bg-zinc-900/90 p-8 text-center shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-400">Checkout Canceled</p>
        <h1 className="mt-3 text-3xl font-bold text-white">No payment was taken</h1>
        <p className="mt-4 text-zinc-300">
          You canceled the payment flow. You can return to the product page and try again at any time.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
          >
            Back to Products
          </Link>
          <Link
            href="/"
            className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </section>
  );
}
