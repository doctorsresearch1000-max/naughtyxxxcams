import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#0B0F19",
        magenta: "#FF007F",
        cyan: "#00F0FF",
        surface: "#121826",
      },
      boxShadow: {
        neon: "0 0 24px rgba(255, 0, 127, 0.35)",
        "neon-cyan": "0 0 20px rgba(0, 240, 255, 0.25)",
      },
      animation: {
        "live-pulse": "live-pulse 1.4s ease-in-out infinite",
        "marquee-up": "marquee-up 12s linear infinite",
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.9)" },
        },
        "marquee-up": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
