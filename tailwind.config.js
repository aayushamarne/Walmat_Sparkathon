/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    'from-red-500', 'to-red-600', 'text-red-600',
    'from-green-500', 'to-green-600', 'text-green-600',
    'from-purple-500', 'to-purple-600', 'text-purple-600',
  ],
  plugins: [],
};
