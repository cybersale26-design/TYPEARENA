"use client";

import { GlassPanel } from "./GlassPanel";

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel className="px-6 py-5 text-center">
      <div className="font-display text-3xl text-cyan-arena text-stroke-glow">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/50">{label}</div>
    </GlassPanel>
  );
}
