/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f6ef",
          100: "#e6ebd2",
          500: "#52734d",
          700: "#31473a",
          900: "#1f2b25"
        },
        accent: {
          100: "#fff1d6",
          400: "#e0a458",
          600: "#bc6c25"
        }
      },
      boxShadow: {
        panel: "0 20px 40px rgba(31, 43, 37, 0.08)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Trebuchet MS", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
