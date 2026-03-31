import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Light Retro Microsoft palette
        navy: "#1A3B6D",
        "dark-navy": "#0F2547",
        "light-navy": "#2B5EA7",
        gold: "#C8A96E",
        "light-gold": "#D4BC8A",
        accent: "#2B5EA7",
        "accent-light": "#3B7DD8",
        "accent-dim": "#1E4D8C",
        // Semantic
        "corp-bg": "#ECF0F5",
        "corp-card": "#FFFFFF",
        "corp-border": "#B8C4CE",
        "corp-text": "#1A1A2E",
        "corp-muted": "#5A6577",
        "corp-subtle": "#8895A7",
      },
      fontFamily: {
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.1)",
        retro: "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
