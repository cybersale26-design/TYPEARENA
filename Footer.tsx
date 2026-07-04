"use client";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-6 text-center text-xs text-white/40">
      <p>
        TypeArena — created by{" "}
        <span className="text-cyan-arena">Waqqas</span> ·{" "}
        <a href="mailto:waqqas@typearena.dev" className="underline decoration-dotted hover:text-cyan-arena">
          waqqas@typearena.dev
        </a>
      </p>
      <p className="mt-1 text-white/25">© {new Date().getFullYear()} TypeArena. All rights reserved.</p>
    </footer>
  );
}
