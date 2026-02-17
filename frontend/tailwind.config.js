// tailwind.config.js  (ESM)
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "aqua-gradient":
          "linear-gradient(to right, #03E2FF, #0FC1D9 75%, #0AB1C7 100%)",
        "home-gradient":
          "linear-gradient(to right, #0A1635, #0E1E45 75%, #12285B 100%)",
      },
      colors: {
        primary: "#07C7E0",
        accent: "#00D0FF",
        dark: "#0A0F1E",
      },
      transitionTimingFunction: {
        app: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
