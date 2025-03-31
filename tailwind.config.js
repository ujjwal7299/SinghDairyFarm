/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#2196F3',
        'light-gray': '#f5f5f5',
      },
    },
  },
  plugins: [],
} 