import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coldColor: "#03045e",
        hotColor: "#dc2f02"
      },
      fontFamily: {
        rubik: ["var(--font-rubik)"]
      }
    },
  },
  plugins: [],
} satisfies Config;
