/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "grid-radial":
          "radial-gradient(circle at top, rgba(14, 165, 233, 0.18), transparent 40%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      },
    },
  },
  plugins: [],
};