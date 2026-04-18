import { Sparkles, Ruler, FlaskConical, CheckCircle2 } from "lucide-react";

import CustomProjectForm from "@/components/custom/CustomProjectForm";

const highlights = [
  {
    icon: Ruler,
    title: "Engineered Precision",
    detail: "Tolerance-aware prints tuned for form, fit, and function.",
  },
  {
    icon: FlaskConical,
    title: "Material Guidance",
    detail: "ASA-CF, PETG, and practical recommendations for your use case.",
  },
  {
    icon: CheckCircle2,
    title: "Production Ready",
    detail: "Prototype-first workflow with quality checks before final output.",
  },
];

export default function CustomOrderPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0b1120] px-4 pb-14 pt-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-80px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/18 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-2xl sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Custom Projects
          </p>

          <h1 className="mt-4 max-w-4xl bg-gradient-to-r from-cyan-200 via-blue-200 to-violet-200 bg-clip-text text-3xl font-semibold leading-tight text-transparent sm:text-5xl">
            Bespoke 3D Engineering, Built Around Your Brief.
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-200/90">
            This page is fully focused on your custom project. Tell us exactly what you need, attach reference images,
            and we will turn your concept into a production-ready outcome with clear timelines and pricing.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, detail }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/15 bg-slate-950/45 p-4 backdrop-blur-xl"
              >
                <span className="inline-flex rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-2 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="mt-3 text-base font-semibold text-zinc-100">{title}</h2>
                <p className="mt-1 text-sm text-zinc-300">{detail}</p>
              </article>
            ))}
          </div>
        </div>

        <CustomProjectForm />
      </div>
    </section>
  );
}
