import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "slide-in-left": "slide-in-left 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-down": "fade-down 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "orb1": "orb1 12s ease-in-out infinite",
        "orb2": "orb2 15s ease-in-out infinite",
        "orb3": "orb3 18s ease-in-out infinite",
        "grad-shift": "gradient-shift 8s ease infinite",
        "rainbow-border": "rainbow-border 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
