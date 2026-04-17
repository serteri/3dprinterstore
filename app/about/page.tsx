import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-950/70 px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            Back to Home
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/75 to-zinc-950 p-8 shadow-[0_32px_90px_rgba(0,0,0,0.5)] sm:p-12">
          <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">About Pera Dynamics</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-zinc-100 sm:text-5xl">
            Engineering the Future of Functional Art.
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 text-zinc-300">
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500">Our Story</h2>
                <p className="mt-3 leading-relaxed">
                  Based in Albion, Brisbane, Pera Dynamics is a boutique studio focused on bespoke additive manufacturing.
                  We combine disciplined engineering, design craftsmanship, and production-grade workflows to create pieces
                  that are both functional and visually striking.
                </p>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500">Materials and Process</h2>
                <p className="mt-3 leading-relaxed">
                  Our builds are produced using carefully tuned profiles for high-performance materials such as ASA-CF,
                  PETG, and other industrial filaments selected for strength, thermal stability, and long-term reliability.
                  Each part goes through controlled calibration, finishing, and quality checks before delivery.
                </p>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500">What We Build</h2>
                <p className="mt-3 leading-relaxed">
                  From refined interior objects to high-utility engineering components, our catalog and custom commissions
                  reflect a minimalist design language and durable product intent. Every project is shaped by precision,
                  material intelligence, and practical use.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/70 text-center text-sm text-zinc-500">
                  Placeholder: Bambu Lab P2S Printer Bay Photo
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/70 text-center text-sm text-zinc-500">
                  Placeholder: Brisbane Workshop Environment Photo
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-800 pt-8">
            <h2 className="text-sm uppercase tracking-[0.22em] text-zinc-500">Core Values</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">01</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">Precision Engineering</h3>
                <p className="mt-2 text-sm text-zinc-400">Targeted 0.01mm accuracy with repeatable process control.</p>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">02</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">Artistic Vision</h3>
                <p className="mt-2 text-sm text-zinc-400">Minimalist design language guided by refined craftsmanship.</p>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">03</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">Material Innovation</h3>
                <p className="mt-2 text-sm text-zinc-400">Industrial-grade durability for real-world performance.</p>
              </article>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Explore Products
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              Request Bespoke Project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
