import Image from "next/image";
import Link from "next/link";
import { Sora } from "next/font/google";
import { Aperture, Gem, Wrench } from "lucide-react";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AboutPage() {
  return (
    <section className={`${sora.className} relative isolate overflow-hidden bg-[#0f172a] px-4 py-14 sm:px-6 lg:px-8`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="pd-glow-pulse absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#3b82f6]/30 blur-[110px]" />
        <div
          className="pd-glow-pulse absolute -right-20 top-20 h-72 w-72 rounded-full bg-[#f97316]/25 blur-[110px]"
          style={{ animationDelay: "-2.4s" }}
        />
        <div
          className="pd-glow-pulse absolute bottom-[-80px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#8b5cf6]/20 blur-[120px]"
          style={{ animationDelay: "-4.8s" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="pd-reveal mb-8 flex justify-start" style={{ animationDelay: "80ms" }}>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-100 backdrop-blur-lg transition-colors hover:border-white/40 hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>

        <div
          className="pd-reveal rounded-3xl border border-white/15 bg-white/10 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-12"
          style={{ animationDelay: "150ms" }}
        >
          <p className="pd-reveal text-xs uppercase tracking-[0.28em] text-blue-200/80" style={{ animationDelay: "220ms" }}>
            About Pera Dynamics
          </p>
          <h1 className="mt-4 max-w-5xl bg-gradient-to-r from-cyan-200 via-blue-300 to-orange-300 bg-clip-text text-4xl font-semibold leading-tight text-transparent sm:text-6xl">
            Where Engineering Meets Vibrant Art.
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div
              className="pd-reveal rounded-2xl border border-white/15 bg-slate-900/35 p-6 backdrop-blur-xl"
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="text-sm uppercase tracking-[0.22em] text-blue-200">The Story</h2>
              <div className="mt-4 space-y-4 text-slate-100/90">
                <p>
                  Pera Dynamics is a Brisbane-based studio, operating from Albion, where Bespoke Craftsmanship meets
                  advanced Additive Manufacturing. We build premium objects that blend precision geometry with expressive,
                  vibrant design direction.
                </p>
                <p>
                  Every production cycle is engineered for consistency, using tuned profiles and careful post-processing to
                  deliver gallery-worthy finishes with dependable real-world performance.
                </p>
                <p>
                  Our preferred materials include high-performance ASA-CF and PETG, chosen for structural integrity,
                  weather resilience, and visual character that elevates both art pieces and functional parts.
                </p>
              </div>
            </div>

            <div
              className="pd-reveal rounded-2xl border border-white/15 bg-slate-900/35 p-3 backdrop-blur-xl"
              style={{ animationDelay: "420ms" }}
            >
              <div className="relative h-full min-h-72 overflow-hidden rounded-xl border border-cyan-300/30 shadow-[0_0_0_1px_rgba(147,197,253,0.15),0_0_35px_rgba(59,130,246,0.25)]">
                <Image
                  src="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1400&q=80"
                  alt="Colorful 3D printing setup with vibrant filaments"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div
            className="pd-reveal mt-10 rounded-2xl border border-white/15 bg-slate-900/35 p-6 backdrop-blur-xl"
            style={{ animationDelay: "560ms" }}
          >
            <h2 className="text-sm uppercase tracking-[0.22em] text-orange-200">Core Values</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-cyan-300/25 bg-slate-900/55 p-5 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                <div className="inline-flex rounded-xl border border-cyan-300/40 bg-cyan-400/10 p-2 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
                  <Aperture className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-cyan-100">Precision Engineering</h3>
                <p className="mt-2 text-sm text-slate-200/85">0.01mm accuracy with robust, repeatable process control.</p>
              </article>

              <article className="rounded-2xl border border-violet-300/25 bg-slate-900/55 p-5 shadow-[0_0_30px_rgba(167,139,250,0.15)]">
                <div className="inline-flex rounded-xl border border-violet-300/40 bg-violet-400/10 p-2 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.35)]">
                  <Gem className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-violet-100">Artistic Vision</h3>
                <p className="mt-2 text-sm text-slate-200/85">Minimalist design language with premium visual identity.</p>
              </article>

              <article className="rounded-2xl border border-orange-300/25 bg-slate-900/55 p-5 shadow-[0_0_30px_rgba(251,146,60,0.15)]">
                <div className="inline-flex rounded-xl border border-orange-300/40 bg-orange-400/10 p-2 text-orange-200 shadow-[0_0_24px_rgba(249,115,22,0.35)]">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-orange-100">Material Innovation</h3>
                <p className="mt-2 text-sm text-slate-200/85">Industrial-grade durability built for real-world usage.</p>
              </article>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div
              className="pd-reveal rounded-2xl border border-white/15 bg-slate-900/35 p-3 backdrop-blur-xl"
              style={{ animationDelay: "700ms" }}
            >
              <div className="relative h-56 overflow-hidden rounded-xl border border-orange-300/30 shadow-[0_0_35px_rgba(249,115,22,0.2)]">
                <Image
                  src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80"
                  alt="Colorful filament spools arranged in workshop"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div
              className="pd-reveal rounded-2xl border border-white/15 bg-slate-900/35 p-3 backdrop-blur-xl"
              style={{ animationDelay: "790ms" }}
            >
              <div className="relative h-56 overflow-hidden rounded-xl border border-blue-300/30 shadow-[0_0_35px_rgba(59,130,246,0.2)]">
                <Image
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1400&q=80"
                  alt="Modern additive manufacturing workshop environment"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="pd-reveal mt-10 flex flex-wrap gap-3" style={{ animationDelay: "920ms" }}>
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.02] hover:from-blue-400 hover:to-purple-500"
            >
              Explore Products
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(14,165,233,0.35)] transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500"
            >
              Bespoke Project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
