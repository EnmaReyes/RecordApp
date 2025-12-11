import React from "react";
import { IoCopy } from "react-icons/io5";
import { formatRate } from "../utils/exchangeRates";
import { toast } from "react-toastify";
import { useRef } from "react";

const CopyRatesButton = ({ baseFiat, mode, allPairs, calculatedRates }) => {
  const btnRef = useRef(null);

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100); // vibración suave
    }
  };

  const animateButton = () => {
    if (!btnRef.current) return;
    btnRef.current.classList.add("scale-95");

    setTimeout(() => {
      btnRef.current.classList.remove("scale-95");
    }, 150);
  };

  const handleCopy = () => {
    const filteredPairs = allPairs.filter((pair) =>
      mode === "para" ? pair.to === baseFiat : pair.from === baseFiat
    );

    const text = [
      `TASAS (${mode === "para" ? "PARA" : "DESDE"} ${baseFiat}):`,
      "",
      ...filteredPairs.map((pair) => {
        const rateObj = calculatedRates.find(
          (r) => r.from === pair.from && r.to === pair.to
        );
        const rate = rateObj?.rate ?? "N/A";

        return `${pair.from} → ${pair.to} : ${rate}`;
      }),
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // 🟦 Toast
        toast.success("Tasas copiadas", {
          position: "bottom-center",
          theme: "dark",
          autoClose: 900,
        });

        // 📱 vibración mobile
        vibrate();

        // 💥 animación del botón
        animateButton();
      })
      .catch((e) => {
        toast.error("Error al copiar");
      });
  };

  return (
    <button
      ref={btnRef}
      onClick={handleCopy}
      className="
        px-4 py-2 rounded-lg font-semibold text-white 
        bg-[#00aaff]
        transition-all duration-300
        hover:shadow-[0_0_15px_#00aaff]
      "
      style={{
        boxShadow: "0 0 8px #00aaff, 0 0 16px #00aaff, inset 0 0 8px #00aaff",
      }}
    >
      <IoCopy />
    </button>
  );
};

export default CopyRatesButton;
