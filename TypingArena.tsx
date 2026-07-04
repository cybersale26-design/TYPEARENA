"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "./GlassPanel";
import type { Quote } from "@/lib/types";

export function TypingArena({
  quote,
  disabled,
  onProgress,
}: {
  quote: Quote;
  disabled: boolean;
  onProgress: (payload: { typedLength: number; correctLength: number; mistakes: number }) => void;
}) {
  const [typed, setTyped] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTyped("");
    setMistakes(0);
    inputRef.current?.focus();
  }, [quote]);

  const correctLength = useMemo(() => {
    let count = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === quote.text[i]) count++;
      else break;
    }
    return count;
  }, [typed, quote.text]);

  useEffect(() => {
    onProgress({ typedLength: typed.length, correctLength, mistakes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, correctLength, mistakes]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length > typed.length) {
        const nextChar = value[value.length - 1];
        const expectedChar = quote.text[value.length - 1];
        if (nextChar !== expectedChar) {
          setMistakes((m) => m + 1);
          setShake(true);
          setTimeout(() => setShake(false), 200);
        }
      }
      if (value.length <= quote.text.length) setTyped(value);
    },
    [typed.length, quote.text]
  );

  return (
    <GlassPanel glow="cyan" className="grid-bg relative p-8">
      <p className="mb-6 text-right text-xs uppercase tracking-widest text-white/40">
        — {quote.author}
      </p>
      <motion.p
        animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.25 }}
        className="select-none font-mono text-2xl leading-relaxed tracking-wide"
      >
        {quote.text.split("").map((char, i) => {
          let style = "text-white/30";
          if (i < correctLength) {
            style = "text-cyan-arena text-stroke-glow";
          } else if (i < typed.length) {
            // Typed but not part of the correct prefix (a typo, or anything
            // after one) — flagged red so it always agrees with the WPM/
            // progress math, which only counts the correct prefix.
            style = "text-danger bg-danger/20 rounded";
          } else if (i === typed.length) {
            style = "text-white border-b-2 border-cyan-arena animate-pulse-glow";
          }
          return (
            <span key={i} className={style}>
              {char}
            </span>
          );
        })}
      </motion.p>

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        disabled={disabled}
        autoFocus
        aria-label="Typing input"
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        spellCheck={false}
        autoComplete="off"
      />

      <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-arena to-purple-arena shadow-glow-cyan"
          animate={{ width: `${(correctLength / quote.text.length) * 100}%` }}
          transition={{ ease: "easeOut", duration: 0.2 }}
        />
      </div>
    </GlassPanel>
  );
}
