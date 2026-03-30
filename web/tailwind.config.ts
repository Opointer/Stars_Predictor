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
        victory: "#2ec27e",
        caution: "#f6c343",
        danger: "#e5484d",
        stars: {
          green: "#006847",
          night: "#0a1d2e",
          mint: "#6fd3a5"
        }
      },
      boxShadow: {
        panel: "0 24px 48px rgba(8, 17, 31, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
