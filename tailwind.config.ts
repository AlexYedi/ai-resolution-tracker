import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        canvas: "#F5EDE3",
        paper: "#FAF6F1",
        card: "#FFFFFF",
        border: "#EDE5DA",
        "text-primary": "#3D2B1F",
        "text-body": "#5C4A3A",
        "text-muted": "#8B6D52",
        "text-caption": "#B09A85",
        amber: {
          DEFAULT: "#C17F4E",
          light: "#D4A574",
          dark: "#A66B3F",
          wash: "#FAF0E6",
        },
        sage: {
          DEFAULT: "#2E8B7A",
          light: "#5BB5A6",
          dark: "#1F6B5E",
          wash: "#E8F4F0",
        },
        rose: {
          DEFAULT: "#C4727F",
          light: "#D9969F",
          dark: "#A65A66",
          wash: "#F5ECEE",
        },
      },
      boxShadow: {
        warm: "0 4px 20px rgba(61, 43, 31, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
