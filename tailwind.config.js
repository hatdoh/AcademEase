/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-purple": "#091e5d",
        "light-white": "rgba(255,255,255,0.17)",
      },
    },
  },
  plugins: [],
}

