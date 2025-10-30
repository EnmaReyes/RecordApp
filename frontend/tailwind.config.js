// tailwind.config.js  (ESM)
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "aqua-gradient":
          "linear-gradient(to right, #03E2FF, #0FC1D9 75%, #0AB1C7 100%)",
        "home-gradient":
          "linear-gradient(to right, #021536, #0C2E69 35%, #10489C 85%, #10499E 100%)",
      },
      colors: {
        primary: "#07C7E0",
        accent: "#00D0FF",
        dark: "#0A0F1E",
      },
    },
  },
  plugins: [],
};
