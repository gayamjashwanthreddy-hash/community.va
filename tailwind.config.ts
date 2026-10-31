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
        brand: {
          bg: "#F4F2EC",
          "bg-alt": "#EAE8E0",
          dark: "#090A0A",
          charcoal: "#171918",
          grey: "#A5A5A0",
          "grey-light": "#D8D7D2",
          border: "#E2E0D8",
          "border-dark": "#252726",
          blue: "#1461C5",
          "blue-hover": "#0F4DA0",
          "blue-light": "#EEF4FC",
          red: "#ED2424",
          "red-hover": "#CB1B1B",
          "red-light": "#FDEAEA",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        display: [
          "Manrope",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Space Grotesk",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
