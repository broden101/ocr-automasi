import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: "#14b8a6", hover: "#2dd4bf" },
      },
    },
  },
  plugins: [],
};
export default config;
