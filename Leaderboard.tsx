"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GlassPanel } from "./GlassPanel";
import { cn } from "@/lib/cn";
import type { EliminationPayload, Player } from "@/lib/types";

export function Leaderboard({
  players,
  selfId,
  eliminations,
}: {
  players: Player[];
  selfId: string;
  eliminations: EliminationPayload[];
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <GlassPanel className="p-4">
        <h3 className="mb-3 font-display text-xs uppercase tracking-widest text-white/50">
          Leaderboard
        </h3>
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                  p.status === "eliminated"
                    ? "border-danger/40 bg-danger/5 opacity-50"
                    : p.id === selfId
                    ? "border-cyan-arena/50 bg-cyan-arena/5"
                    : "border-white/10 bg-white/[0.02]",
                  p.status === "finished" && "border-gold/50 bg-gold/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 font-mono text-white/40">{i + 1}</span>
                  <span
                    className={cn(
                      "truncate max-w-[110px]",
                      p.status === "eliminated" && "line-through text-white/40"
                    )}
                  >
                    {p.name}
                  </span>
                  {p.status === "finished" && (
                    <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] text-gold">
                      DONE
                    </span>
                  )}
                  {p.status === "eliminated" && (
                    <span className="rounded bg-danger/20 px-1.5 py-0.5 text-[10px] text-danger">
                      OUT
                    </span>
                  )}
                </div>
                <span className="font-mono text-cyan-arena">{p.wpm}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassPanel>

      <GlassPanel className="flex-1 p-4">
        <h3 className="mb-3 font-display text-xs uppercase tracking-widest text-white/50">
          Elimination Feed
        </h3>
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {eliminations
              .slice()
              .reverse()
              .map((e, idx) => (
                <motion.div
                  key={`${e.id}-${idx}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-danger">{e.name} eliminated</span>
                  <div className="text-white/50">
                    {e.wpm} WPM / {e.accuracy}% — {e.reason}
                  </div>
                </motion.div>
              ))}
            {eliminations.length === 0 && (
              <p className="text-xs text-white/30">No eliminations yet. Stay sharp.</p>
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </div>
  );
}
