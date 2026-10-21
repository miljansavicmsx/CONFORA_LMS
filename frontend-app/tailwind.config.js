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
        /** Light public shell on :root; dark dashboard shell on `.dark`. */
        surface: {
          primary: "hsl(var(--surface-primary) / <alpha-value>)",
          secondary: "hsl(var(--surface-secondary) / <alpha-value>)",
          tertiary: "hsl(var(--surface-tertiary) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          solid: "hsl(var(--brand-solid) / <alpha-value>)",
          hover: "hsl(var(--brand-hover) / <alpha-value>)",
        },
        text: {
          primary: "hsl(var(--text-primary) / <alpha-value>)",
          secondary: "hsl(var(--text-secondary) / <alpha-value>)",
          muted: "hsl(var(--text-muted) / <alpha-value>)",
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
