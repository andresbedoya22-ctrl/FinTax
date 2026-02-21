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
        bg: "#0D1B2A",
        surface: "#12263A",
        surface2: "#102338",
        border: "#223246",
        text: "#EAF0F6",
        secondary: "#B8C4D2",
        muted: "#8EA0B5",
        green: "#4CAF50",
        "green-hover": "#5BD15F",
        teal: "#2DD4BF",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      borderRadius: {
        sm: "12px",
        md: "16px",
        lg: "24px",
        card: "24px",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "glass-soft": "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Space Grotesk", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
