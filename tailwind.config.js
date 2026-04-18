/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#00B4C8", dark: "#0096A8", light: "#E0F7FA" },
        purple: { DEFAULT: "#7B2FBE", light: "#F3E8FF" },
        brand: { dark: "#1A1A2E" },
      },
    },
  },
  plugins: [],
};

module.exports = config;
