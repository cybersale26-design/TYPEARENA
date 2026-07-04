"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassPanel({
  children,
  className,
  glow,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: "cyan" | "magenta" | "purple" | "danger" | "gold";
}) {
  const glowClass = glow
    ? {
        cyan: "shadow-glow-cyan",
        magenta: "shadow-glow-magenta",
        purple: "shadow-glow-purple",
        danger: "shadow-glow-danger",
        gold: "shadow-glow-gold",
      }[glow]
    : "";

  return (
    <div className={cn("glass-panel relative overflow-hidden", glowClass, className)} {...rest}>
      <div className="scanline-overlay" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
