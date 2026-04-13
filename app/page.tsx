import Link from "next/link";
import { ArrowRight, Layers, Zap, Paintbrush, Package } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    title: "Geometric Desk Organizer",
    price: "$24.99",
    tag: "Bestseller",
  },
  {
    id: 2,
    title: "Custom Phone Stand",
    price: "$14.99",
    tag: "Customizable",
  },
  {
    id: 3,
    title: "Articulated Dragon",
    price: "$39.99",
    tag: "New",
  },
  {
    id: 4,
    title: "Miniature Architecture",
    price: "$54.99",
    tag: "Premium",
  },
];

const features = [
  {
    icon: Paintbrush,
    title: "Fully Customizable",
    description:
      "Submit your own design or choose from our templates. Every print is tailored to you.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description:
      "Most standard orders ship within 2–3 business days from our production floor.",
  },
  {
    icon: Package,
    title: "Premium Materials",
    description:
      "PLA, PETG, ABS, and resin options. Durable, precise, and built to last.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-zinc-950">
        {/* Background grid decoration */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <Layers size={12} />
              Layer by layer, made for you
            </span>

            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Precision{" "}
              <span className="text-cyan-400">3D Printing</span>
              <br />
              On Demand
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              From complex engineering prototypes to unique home decor — we
              print your vision with industry-grade accuracy and speed.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Pills ─────────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-6 transition-colors hover:border-cyan-400/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm leading-6 text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────── */}
      <section className="bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Featured Products
              </h2>
              <p className="mt-2 text-zinc-400">
                Hand-picked favourites from our catalogue.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300 sm:flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
              >
                {/* Image placeholder */}
                <div className="flex aspect-square items-center justify-center bg-zinc-800">
                  <Layers
                    size={48}
                    className="text-zinc-600 transition-colors group-hover:text-cyan-400/40"
                    strokeWidth={1}
                  />
                </div>

                {/* Tag */}
                <span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
                  {product.tag}
                </span>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <h3 className="font-medium text-white">{product.title}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-cyan-400">
                      {product.price}
                    </span>
                    <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-cyan-400/40 hover:text-white">
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Have a design in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Upload your STL or share your idea — we&apos;ll turn it into reality
            with precision and care.
          </p>
          <Link
            href="/custom"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-8 py-3.5 font-semibold text-zinc-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.4)]"
          >
            Start a Custom Order <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
