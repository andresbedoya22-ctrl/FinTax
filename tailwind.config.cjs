/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        green: "rgb(var(--accent-green) / <alpha-value>)",
        "green-hover": "rgb(var(--accent-green-strong) / <alpha-value>)",
        teal: "rgb(var(--accent-teal) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        copper: "rgb(var(--accent-copper) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        card: "var(--radius-xl)",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        "glass-soft": "var(--shadow-glass-soft)",
        panel: "var(--shadow-panel)",
        floating: "var(--shadow-floating)",
      },
      fontFamily: {
        heading: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-sans)", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
    },
  },
};
