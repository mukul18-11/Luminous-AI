/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00FF41",
        "primary-dim": "#00cc34",
        "primary-container": "#003d10",
        "on-primary": "#000000",
        secondary: "#00D1FF",
        "secondary-container": "#004e63",
        "on-secondary": "#003544",
        surface: "#000000",
        "surface-container-lowest": "#0a0a0a",
        "surface-container-low": "#1a1c1e",
        "surface-container": "#1c1c1c",
        "surface-container-high": "#1a1a1a",
        "surface-container-highest": "#262626",
        "on-surface": "#f8fafc",
        "on-surface-variant": "#94a3b8",
        "outline-variant": "rgba(255, 255, 255, 0.1)",
        error: "#ef4444",
        "error-container": "#93000a",
        tertiary: "#efb8c8",
        "tertiary-container": "#702840",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
