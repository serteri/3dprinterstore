"use client";

import { Lock, ArrowRight } from "lucide-react";
import { useActionState } from "react";

import { adminLoginInitialState, loginAdmin } from "@/app/actions/auth";

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, adminLoginInitialState);

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-[0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="border-b border-zinc-800 bg-zinc-900/70 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Pera Dynamics</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Admin Access</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter the owner password to continue to the control center.</p>
      </div>

      <form action={formAction} className="space-y-4 px-6 py-6">
        <label htmlFor="password" className="text-sm font-medium text-zinc-200">
          Password
        </label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter owner password"
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-[#0EA5B7]"
          />
        </div>

        {state.error ? (
          <p className="rounded-lg border border-red-800/70 bg-red-950/40 px-3 py-2 text-sm text-red-200">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0EA5B7] px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#21C1D3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Verifying..." : "Unlock Admin Dashboard"}
          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
