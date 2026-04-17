import React from "react";
import { IoCopy } from "react-icons/io5";
import { formatRate } from "../utils/exchangeRates";
import { toast } from "react-toastify";
import { useRef } from "react";

const CopyRatesButton = ({ baseFiat, mode, allPairs, calculatedRates }) => {
  const btnRef = useRef(null);

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200); // vibración suave
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
      mode === "para" ? pair.to === baseFiat : pair.from === baseFiat,
    );

    const text = [
      `TASAS (${mode === "para" ? "PARA" : "DESDE"} ${baseFiat}):`,
      "",
      ...filteredPairs.map((pair) => {
        const rateObj = calculatedRates.find(
          (r) => r.from === pair.from && r.to === pair.to,
        );
        const rate = rateObj?.rate ?? "N/A";

        return `${pair.from} → ${pair.to} : ${formatRate(rate)}`;
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
    >
      <IoCopy />
    </button>
  );
};

const CopyRateButton = ({ from, to, rateValue }) => {
  const handleCopy = () => {
    const text = `Tasa de: ${from} → ${to} : *${formatRate(rateValue)}*`;

    navigator.clipboard.writeText(text).then(() => {
      // Toast notification
      toast.success("Tasa copiada!", {
        position: "bottom-center",
        theme: "dark",
        autoClose: 900,
      });

      if (navigator.vibrate) navigator.vibrate(150);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 rounded-lg font-semibold text-white 
        bg-[#00aaff]
        transition-all duration-300
        hover:shadow-[0_0_15px_#00aaff]
      "
    >
      <IoCopy />
    </button>
  );
};

const CopyCalculatorButton = ({
  fromAmount,
  fromFiat,
  toAmount,
  toFiat,
  rate,
}) => {
  const btnRef = useRef(null);

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleCopy = () => {
    const text = `Si Envías *${fromAmount}* ${fromFiat}, Recibes *${toAmount}* ${toFiat}
Tasa en: *${formatRate(rate)}*`;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Conversión copiada", {
          position: "bottom-center",
          theme: "dark",
          autoClose: 900,
        });

        vibrate();
      })
      .catch((e) => {
        toast.error("Error al copiar");
      });
  };

  return (
    <button
      ref={btnRef}
      onClick={handleCopy}
      className={`text-xs font-semibold px-3 py-2 rounded-lg transition transform hover:scale-105 bg-cyan-500/60 text-white hover:bg-cyan-500`}
    >
      Copiar
    </button>
  );
};

export { CopyRatesButton, CopyRateButton, CopyCalculatorButton };
