import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Paintbrush,
  Sparkles,
  Workflow,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";

const features = [
  {
    icon: Paintbrush,
    title: "Bespoke Design",
    description:
      "From concept sketches to refined production parts, every print is tailored to your exact brief.",
  },
  {
    icon: Workflow,
    title: "Rapid Iteration",
    description:
      "Fast prototyping cycles with clear communication from first draft to final delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Industrial Materials",
    description:
      "High-performance options like PETG and ASA-CF for durability, precision, and premium finish quality.",
  },
];

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0b1020]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-blue-500/25 blur-[120px]" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]" />
          <div className="absolute bottom-[-110px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-400/20 blur-[130px]" />
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium tracking-wide text-cyan-100 backdrop-blur-lg">
              <Sparkles size={13} />
              Premium Additive Manufacturing in Brisbane
            </span>

            <h1 className="max-w-4xl bg-gradient-to-r from-cyan-200 via-blue-300 to-fuchsia-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Engineering Precision,
              <br />
              Crafted in Color.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Pera Dynamics turns bold concepts into production-ready pieces, combining high-performance materials,
              clean geometry, and modern design language.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(79,70,229,0.45)] transition-all hover:scale-[1.02] hover:from-blue-400 hover:to-purple-500"
              >
                Explore Collection <ArrowRight size={16} />
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-cyan-300/60 hover:bg-cyan-400/10"
              >
                Start Bespoke Project
              </Link>
            </div>

            <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-lg">
                <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/80">Accuracy</p>
                <p className="mt-1 text-2xl font-semibold text-white">0.01mm</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-lg">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Materials</p>
                <p className="mt-1 text-2xl font-semibold text-white">ASA-CF / PETG</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-lg">
                <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-200/80">Turnaround</p>
                <p className="mt-1 text-2xl font-semibold text-white">2-3 Days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0c1328]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center gap-2 text-zinc-200">
            <Layers size={16} className="text-cyan-300" />
            <h2 className="text-xl font-semibold">Why Pera Dynamics</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-300/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-blue-400/20 text-cyan-200 shadow-[0_0_24px_rgba(56,189,248,0.2)] transition-all group-hover:shadow-[0_0_30px_rgba(56,189,248,0.35)]">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm leading-6 text-zinc-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1020] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-3xl font-bold text-transparent">
                Featured Products
              </h2>
              <p className="mt-2 text-zinc-300">
                Hand-picked pieces with modern aesthetics and engineering-grade reliability.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200 sm:flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-12 text-center backdrop-blur-xl">
              <h3 className="text-2xl font-semibold text-white">Our collection is coming soon</h3>
              <p className="mx-auto mt-3 max-w-xl text-zinc-300">
                We are currently preparing premium product drops. Check back shortly to discover our latest 3D printed creations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    price: Number(product.price),
                    images: product.images,
                    createdAt: product.createdAt,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-[#101a34]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-8 h-52 w-52 rounded-full bg-cyan-500/20 blur-[100px]" />
          <div className="absolute bottom-8 right-8 h-52 w-52 rounded-full bg-purple-500/20 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Have a design in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-300">
            Upload your STL or share your idea — we&apos;ll turn it into reality
            with precision and care.
          </p>
          <Link
            href="/custom"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 font-semibold text-white shadow-[0_12px_34px_rgba(14,165,233,0.4)] transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500"
          >
            Start a Custom Order <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
