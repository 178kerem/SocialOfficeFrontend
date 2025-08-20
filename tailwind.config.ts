// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: {
    animation: { 'spin-slower': 'spin 3s linear infinite' },
  } },
  plugins: [],
} satisfies Config;
