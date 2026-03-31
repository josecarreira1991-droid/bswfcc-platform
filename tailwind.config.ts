import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Institutional corporate palette
        navy: "#1B3A6B",
        "dark-navy": "#0D1B2A",
        "light-navy": "#2A4F8F",
        gold: "#C8A96E",
        "light-gold": "#D4BC8A",
        accent: "#2D5F8A",
        // Semantic
        "corp-bg": "#F8F9FA",
        "corp-card": "#FFFFFF",
        "corp-border": "#E2E8F0",
        "corp-text": "#1E293B",
        "corp-muted": "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
