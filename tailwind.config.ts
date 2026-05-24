import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"]
      },
      colors: {
        canvas: "#07111F",
        ink: "#0F172A",
        mist: "#EEF4FF",
        brand: {
          50: "#EBF8FF",
          100: "#D6F0FF",
          500: "#12B6FF",
          600: "#0A8FD1",
          700: "#086E9F"
        },
        accent: {
          500: "#22C55E",
          600: "#16A34A"
        },
        warn: {
          500: "#F97316"
        }
      },
      boxShadow: {
        glow: "0 18px 45px rgba(10, 143, 209, 0.18)",
        soft: "0 14px 30px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(circle at top left, rgba(18, 182, 255, 0.22), transparent 35%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.18), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(236, 245, 255, 0.92))",
        "mesh-dark":
          "radial-gradient(circle at top left, rgba(18, 182, 255, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.18), transparent 25%), linear-gradient(135deg, rgba(7, 17, 31, 0.96), rgba(15, 23, 42, 0.94))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "70%": { transform: "scale(1.06)", opacity: "0" },
          "100%": { transform: "scale(1.06)", opacity: "0" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseRing: "pulseRing 2.8s ease-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
