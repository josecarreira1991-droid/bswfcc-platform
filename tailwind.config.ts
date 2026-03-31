import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Dark Bento Purple palette (from approved Canva design)
        navy: "#13141B",
        "dark-navy": "#0E0F15",
        "light-navy": "#1A1C28",
        gold: "#C8A96E",
        "light-gold": "#D4BC8A",
        accent: "#8B5CF6",
        "accent-light": "#A78BFA",
        "accent-dim": "#7C3AED",
        // Semantic tokens
        "corp-bg": "#13141B",
        "corp-card": "#1A1C28",
        "corp-border": "rgba(139,92,246,0.08)",
        "corp-text": "#E8ECF2",
        "corp-muted": "#6B7280",
        "corp-subtle": "#3D4452",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        bento: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
