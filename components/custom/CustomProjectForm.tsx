"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { ArrowRight, ImagePlus, Layers, Send, Sparkles, Trash2 } from "lucide-react";

import ImageUpload from "@/components/ui/ImageUpload";
import {
  customInquiryInitialState,
  submitCustomInquiry,
} from "@/app/actions/custom";

const PROJECT_TYPES = [
  "Prototype",
  "Functional Part",
  "Product Concept",
  "Art Piece",
  "Replacement Component",
  "Other",
] as const;

const MATERIALS = ["No preference", "ASA-CF", "PETG", "PLA", "ABS", "Need recommendation"] as const;

export default function CustomProjectForm() {
  const [state, formAction, isPending] = useActionState(submitCustomInquiry, customInquiryInitialState);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const referencesValue = useMemo(() => referenceImages.join(","), [referenceImages]);

  function addUploadedImages(urls: string[]) {
    setReferenceImages((prev) => Array.from(new Set([...prev, ...urls])));
  }

  function removeImage(url: string) {
    setReferenceImages((prev) => prev.filter((item) => item !== url));
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-2xl sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/85">Custom Brief Form</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Tell us what you want to build</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300">
            Share your project details, preferred materials, timeline, and references. We will review and reply with scope,
            timeline, and pricing.
          </p>
        </div>
        <span className="hidden rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100 sm:inline-flex">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Premium Custom Service
        </span>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="referenceImages" value={referencesValue} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Full Name</span>
            <input
              name="name"
              required
              placeholder="Your name"
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Phone (Optional)</span>
            <input
              name="phone"
              placeholder="+61 ..."
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Project Type</span>
            <select
              name="projectType"
              required
              defaultValue=""
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-300/70"
            >
              <option value="" disabled>
                Select project type
              </option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Preferred Material</span>
            <select
              name="material"
              defaultValue="No preference"
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-300/70"
            >
              {MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Quantity (Optional)</span>
            <input
              name="quantity"
              placeholder="e.g. 1 prototype, 20 units"
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Budget Range (Optional)</span>
            <input
              name="budget"
              placeholder="e.g. AUD 150 - 400"
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-100">Preferred Timeline (Optional)</span>
            <input
              name="timeline"
              placeholder="e.g. Within 2 weeks"
              className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-100">Project Brief</span>
          <textarea
            name="details"
            required
            rows={6}
            placeholder="Tell us exactly what you need: dimensions, function, tolerance, finish, colors, use case, and any constraints."
            className="w-full rounded-xl border border-white/20 bg-slate-950/65 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-300/70"
          />
        </label>

        <div className="rounded-2xl border border-white/15 bg-slate-950/45 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-100">
            <ImagePlus className="h-4 w-4 text-cyan-200" />
            Reference Images (Optional)
          </div>
          <ImageUpload endpoint="productImage" multiple onUploadsComplete={addUploadedImages} />

          {referenceImages.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {referenceImages.map((url) => (
                <div key={url} className="group relative overflow-hidden rounded-xl border border-white/15 bg-zinc-900/80">
                  <div className="relative h-24 w-full">
                    <Image src={url} alt="Uploaded reference" fill sizes="120px" className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/50 text-zinc-100 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {state.error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{state.error}</p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {state.success}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <Layers className="h-3.5 w-3.5" />
            Typical response within 1 business day.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.35)] transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isPending ? "Submitting..." : "Submit Project Brief"}
            {isPending ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
