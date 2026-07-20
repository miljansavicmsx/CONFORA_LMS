import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "cf-trophy-sway": {
          "0%, 100%": { transform: "rotate(-5deg) scale(1)" },
          "50%": { transform: "rotate(5deg) scale(1.03)" },
        },
      },
      animation: {
        "cf-trophy-sway": "cf-trophy-sway 5s ease-in-out infinite",
      },
      boxShadow: {
        elevated:
          "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(14, 165, 233, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Geist", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        linkedin: "#0A66C2",
        /** CONFORA LMS dark shell (D.2) */
        surface: {
          primary: "#0F172A",
          secondary: "#1E293B",
          tertiary: "#334155",
        },
        brand: {
          DEFAULT: "#0EA5E9",
          solid: "#0369A1",
          hover: "#0284C7",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#8A9BB2",
        },
        confora: {
          primary: "#1F4E79",
          surface: "#F8FAFC",
          ink: "#0F172A",
          brand: "#0EA5E9",
        },
      },
    },
  },
  plugins: [typography],
};
