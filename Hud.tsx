"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { cn } from "@/lib/cn";

export function Hud({
  roomCode,
  startTime,
  timeoutMs,
  status,
}: {
  roomCode: string;
  startTime: number | null;
  timeoutMs: number;
  status: string;
}) {
  const [remainingMs, setRemainingMs] = useState(timeoutMs);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, timeoutMs - (Date.now() - startTime));
      setRemainingMs(remaining);
    }, 250);
    return () => clearInterval(interval);
  }, [startTime, timeoutMs]);

  const seconds = Math.ceil(remainingMs / 1000);
  const isDanger = seconds <= 20 && status === "active";

  return (
    <GlassPanel
      className={cn("flex items-center justify-between px-6 py-3", isDanger && "shadow-glow-danger")}
    >
      <div className="flex items-center gap-3">
        <span className="font-display text-lg tracking-widest text-cyan-arena">TYPEARENA</span>
        <span className="rounded-md border border-white/15 px-2 py-1 font-mono text-xs text-white/60">
          ROOM {roomCode}
        </span>
      </div>
      <div
        className={cn(
          "font-mono text-2xl",
          isDanger ? "text-danger animate-pulse-glow" : "text-cyan-arena"
        )}
      >
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </div>
      <span className="rounded-md border border-white/15 px-3 py-1 text-xs uppercase tracking-widest text-white/60">
        {status}
      </span>
    </GlassPanel>
  );
}
