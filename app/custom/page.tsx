export default function CustomOrderPage() {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Custom Projects</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-100 sm:text-4xl">Custom 3D Engineering Orders</h1>
        <p className="mt-5 text-zinc-300">
          For custom 3D engineering projects, contact us at
          {" "}
          <a
            href="mailto:info@peradynamics.com"
            className="font-medium text-zinc-100 underline decoration-zinc-500 underline-offset-4 hover:decoration-zinc-300"
          >
            info@peradynamics.com
          </a>
          .
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          Include your project goals, dimensions, material preference, quantity, and target delivery timeline.
        </p>
      </div>
    </section>
  );
}
