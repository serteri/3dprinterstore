import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">About Pera Dynamics</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-100 sm:text-4xl">3D Engineered Art from Brisbane</h1>

        <div className="mt-6 space-y-4 text-zinc-300">
          <p>
            Pera Dynamics creates premium, design-forward 3D printed products that blend engineering precision with artistic character.
            Every piece is designed and produced with care in Brisbane.
          </p>
          <p>
            Founded by Serter, a developer and 3D printing enthusiast, the studio focuses on clean execution, durable materials,
            and thoughtful product experiences.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
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
            Request Custom Work
          </Link>
        </div>
      </div>
    </section>
  );
}
