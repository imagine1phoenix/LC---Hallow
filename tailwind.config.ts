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
          darkest: "#07060a",
          bg: "#0c0a14",
          card: "#141121",
          surface: "#1d1930",
          border: "#2d2745",
          highlight: "#443b66",
          parchment: "#f4ede2",
          bone: "#d1c7bd",
          muted: "#8c85a3",
          gold: "#d4af37",
          candle: "#f59e0b",
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
        candle: "0 0 25px -5px rgba(245, 158, 11, 0.25)",
        crimson: "0 0 25px -5px rgba(225, 29, 72, 0.3)",
        parchment: "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
      },
      animation: {
        flicker: "flicker 4s infinite alternate",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
      keyframes: {
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
      },
    },
  },
  plugins: [],
};
export default config;

