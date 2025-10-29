// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00F5FF", // celeste neón
        accent: "#00D0FF", // turquesa brillante
        dark: "#0A0F1E", // texto oscuro
      },
         backgroundImage: {
        'three-stop-gradient': 'linear-gradient(to right, #001820, #002833 40%, #00313A 100%)',
      },
    },
  },
  plugins: [],
};
