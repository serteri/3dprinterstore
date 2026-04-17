export default function CustomOrderPage() {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Custom Services</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-zinc-100 sm:text-4xl">
              Bespoke 3D Engineering & Rapid Prototyping
            </h1>
            <p className="mt-4 max-w-2xl text-zinc-300">
              From one-off concept models to small-batch production, we deliver precise, presentation-ready prints with technical rigor.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Step 1</p>
                <h2 className="mt-2 text-lg font-medium text-zinc-100">Design Brief</h2>
                <p className="mt-2 text-sm text-zinc-400">Share goals, dimensions, files, and intended use case.</p>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Step 2</p>
                <h2 className="mt-2 text-lg font-medium text-zinc-100">Prototyping</h2>
                <p className="mt-2 text-sm text-zinc-400">We test fit, form, and tolerances with rapid iterations.</p>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Step 3</p>
                <h2 className="mt-2 text-lg font-medium text-zinc-100">Final Production</h2>
                <p className="mt-2 text-sm text-zinc-400">Approved design is finalized and prepared for dispatch.</p>
              </article>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-700 bg-zinc-950/75 p-5">
              <p className="text-sm text-zinc-400">Discuss your project directly with our engineering desk.</p>
              <a
                href="mailto:info@peradynamics.com?subject=Custom%20Project%20Inquiry"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-zinc-500 bg-zinc-100 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-950 transition-colors hover:border-zinc-300 hover:bg-white"
              >
                Contact for Custom Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
