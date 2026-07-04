import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0F",
        navy: {
          from: "#0F1220",
          to: "#141A30",
        },
        cyan: {
          arena: "#00F0FF",
        },
        magenta: {
          arena: "#FF00AA",
        },
        purple: {
          arena: "#7B2CFF",
        },
        danger: "#FF3860",
        gold: "#FFC94D",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0,240,255,0.45), 0 0 60px rgba(0,240,255,0.15)",
        "glow-magenta": "0 0 20px rgba(255,0,170,0.45), 0 0 60px rgba(255,0,170,0.15)",
        "glow-purple": "0 0 20px rgba(123,44,255,0.45), 0 0 60px rgba(123,44,255,0.15)",
        "glow-danger": "0 0 20px rgba(255,56,96,0.55), 0 0 60px rgba(255,56,96,0.2)",
        "glow-gold": "0 0 25px rgba(255,201,77,0.55), 0 0 70px rgba(255,201,77,0.25)",
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(160deg, #0F1220 0%, #141A30 100%)",
        "arena-radial":
          "radial-gradient(circle at 50% 0%, rgba(0,240,255,0.08), transparent 60%)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 1.4s ease-in-out infinite",
        scan: "scan 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
