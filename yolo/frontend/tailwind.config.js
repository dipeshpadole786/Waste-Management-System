import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A1628",
          900: "#0C1B33",
          800: "#152238"
        },
        saffron: {
          600: "#E07B2A",
          500: "#F5A623",
          50: "#FEF3E7"
        },
        green: {
          700: "#1A6B3A",
          600: "#228B4A",
          50: "#EAF5EE"
        }
      },
      boxShadow: {
        soft: "0 6px 18px rgba(10,22,40,0.12), 0 2px 8px rgba(10,22,40,0.06)"
      },
      borderRadius: {
        xl2: "1rem"
      }
    }
  },
  plugins: [forms]
};
