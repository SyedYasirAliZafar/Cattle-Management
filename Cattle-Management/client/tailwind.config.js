/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFEFB",
        white: "#FFFFFF",
        // "forest" now carries the deep crimson/maroon brand tone from the
        // Noori Cattle Farm logo (used for headings and primary buttons) —
        // kept as the same key so every existing text-forest / bg-forest
        // class picks up the new theme.
        forest: {
          DEFAULT: "#8B1A1A",
          light: "#B32424",
          dark: "#5C1010",
        },
        brass: {
          DEFAULT: "#D9A227",
          light: "#E8C066",
          dark: "#B96D08",
        },
        charcoal: "#2A2A28",
        sand: "#EDE1C0",
        sandlight: "#FBF6E9",
        status: {
          overdue: "#B8241F",
          duesoon: "#D9A227",
        },
      },
      fontFamily: {
        serif: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 2px rgba(42, 42, 40, 0.06), 0 2px 8px rgba(42, 42, 40, 0.04)",
        card: "0 1px 3px rgba(42, 42, 40, 0.06), 0 4px 16px rgba(42, 42, 40, 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
