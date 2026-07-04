"use client";

import { GlassPanel } from "./GlassPanel";
import { AccuracyGauge } from "./AccuracyGauge";
import type { Player } from "@/lib/types";

export function PlayerStatsPanel({ player }: { player: Player | undefined }) {
  if (!player) return null;

  return (
    <GlassPanel className="flex flex-col gap-6 p-5">
      <div>
        <div className="text-xs uppercase tracking-widest text-white/40">Your WPM</div>
        <div className="font-display text-5xl text-cyan-arena text-stroke-glow">{player.wpm}</div>
      </div>

      <AccuracyGauge value={player.accuracy} />

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] py-3">
          <div className="font-mono text-xl text-danger">{player.mistakes}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">Mistakes</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] py-3">
          <div className="font-mono text-xl text-magenta-arena">🔥 {player.combo}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">Combo</div>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-white/40">
          <span>Progress</span>
          <span>{player.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-purple-arena shadow-glow-purple transition-all"
            style={{ width: `${player.progress}%` }}
          />
        </div>
      </div>
    </GlassPanel>
  );
}
