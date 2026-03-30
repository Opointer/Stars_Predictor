import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        ice: "#eef6fb",
        steel: "#133047",
        aurora: "#0c1726",
        night: "#040b13",
        victory: "#2ec27e",
        caution: "#f6c343",
        danger: "#e5484d",
        stars: {
          green: "#006847",
          night: "#0a1d2e",
          mint: "#6fd3a5"
        }
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-barlow)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"]
      },
      boxShadow: {
        panel: "0 28px 60px rgba(2, 7, 15, 0.42)",
        glow: "0 0 0 1px rgba(111, 211, 165, 0.14), 0 18px 40px rgba(111, 211, 165, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
