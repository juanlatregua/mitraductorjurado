import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de diseño mitraductorjurado.es — verde-dorado
        primary: {
          DEFAULT: "#1A3A2A",
          mid: "#2C5F3E",
          light: "#3A6A4A",
        },
        gold: {
          DEFAULT: "#C9882A",
          light: "#D4A04A",
        },
        surface: {
          DEFAULT: "#FAF7F2",
        },
        mtj: {
          dark: "#1C1917",
          light: "#F0EBE0",
          muted: "#6A9A7A",
          gray: "#888888",
          border: "#E8E2D8",
          footer: "#070F0A",
        },
        // Azul marino institucional — dashboards legacy
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
        },
        // Acento cálido — dashboards legacy
        accent: {
          50: "#fff8f0",
          100: "#ffecd2",
          200: "#fcd9b6",
          300: "#f5c28e",
          400: "#eda561",
          500: "#e08a3c",
          600: "#c97326",
          700: "#a65d1b",
          800: "#834915",
          900: "#633812",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        // Legacy
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
