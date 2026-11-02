import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nevermore: {
          darkest: "#09070D",     // Input background / deepest shade
          bg: "#0B0810",          // Main background
          card: "#151020",        // Card background
          surface: "#1A1428",     // Elevated surface
          border: "#33263E",      // Border color
          highlight: "#4A385A",   // Hover border / highlight
          parchment: "#F2EBDD",   // Main text
          bone: "#DDD4C6",        // Neutral bone text
          muted: "#A99BB8",       // Secondary text (high contrast)
          gold: "#D6A63C",        // Primary gold
          candle: "#D6A63C",      // Primary gold action accent
          crimson: "#881337",
          blood: "#b91c1c",
          seal: "#e11d48",
          emerald: "#10b981",
          amethyst: "#7c3aed",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        candle: "0 0 25px -5px rgba(214, 166, 60, 0.25)",
        crimson: "0 0 25px -5px rgba(225, 29, 72, 0.3)",
        parchment: "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
      },
      animation: {
        flicker: "flicker 4s infinite alternate",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        fadeIn: "fadeIn 0.35s ease-out",
        fadeInUp: "fadeInUp 0.4s ease-out",
        fadeInScale: "fadeInScale 0.3s ease-out",
        slideInRight: "slideInRight 0.35s ease-out",
        float: "floatSlow 4s ease-in-out infinite",
        borderPulse: "borderPulse 2s ease-in-out infinite",
        shimmer: "shimmer 3s infinite",
        crestEntrance: "crestEntrance 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        titleEntrance: "titleEntrance 0.28s cubic-bezier(0.16, 1, 0.3, 1) 0.16s backwards",
      },
      keyframes: {
        crestEntrance: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        titleEntrance: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(0.92)" },
          "70%": { opacity: "0.95", filter: "brightness(1.05)" },
          "85%": { opacity: "0.78", filter: "brightness(0.88)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
        borderPulse: {
          "0%, 100%": { borderColor: "rgba(214, 166, 60, 0.3)" },
          "50%": { borderColor: "rgba(214, 166, 60, 0.7)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
