"use client";

import { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cyan-arena/10 border border-cyan-arena text-cyan-arena hover:bg-cyan-arena/20 shadow-glow-cyan",
  secondary:
    "bg-magenta-arena/10 border border-magenta-arena text-magenta-arena hover:bg-magenta-arena/20 shadow-glow-magenta",
  ghost:
    "bg-white/5 border border-white/15 text-white/80 hover:border-white/40 hover:text-white",
};

export function NeonButton({
  children,
  variant = "primary",
  className,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
      className={cn(
        "rounded-xl px-6 py-3 font-display text-sm tracking-wider uppercase transition-colors",
        variantClasses[variant],
        disabled && "pointer-events-none opacity-40",
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
