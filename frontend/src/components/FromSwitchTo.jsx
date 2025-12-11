import React, { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";

const NeonModeSwitchFlag = ({
  mode,
  setMode,
  baseFiat,
  fiatFlags,
  fiatNames,
}) => {
  const [flip, setFlip] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mode");
    if (saved && saved !== mode) setMode(saved);
  }, []);

  const toggle = () => {
    if (navigator.vibrate) navigator.vibrate(35);

    setShake(true);
    setTimeout(() => setShake(false), 350);

    setFlip(true);
    setTimeout(() => setFlip(false), 550);

    const newMode = mode === "desde" ? "para" : "desde";
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  };

  return (
    <div className="flex flex-col items-center mt-6">
      {/* Mobile help text */}
      <div className="md:hidden text-xs text-cyan-300 animate-pulse mb-1">
        Toca para cambiar
      </div>

      <div
        onClick={toggle}
        className={`relative w-[260px] h-16 rounded-full bg-[#0d1f3a] border border-[#29d3ff66]
          cursor-pointer overflow-hidden perspective duration-300
          shadow-[0_0_18px_#1bcfff66] hover:shadow-[0_0_25px_#1bcfffaa]
          flex items-center justify-center
          ${shake ? "animate-shake" : ""}
        `}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center gap-4 text-lg font-semibold 
            text-white transform-style-preserve transition-transform duration-500
            ${flip ? "rotate-y-180" : ""}
        `}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center gap-3">
            <ReactCountryFlag
              countryCode={fiatFlags[baseFiat.fiat]}
              svg
              style={{ fontSize: "2em" }}
            />

            <div className="flex flex-col items-center">
              <span className="text-cyan-300 drop-shadow-[0_0_6px_#1bcfff]">
                {mode === "desde"
                  ? `DESDE ${baseFiat.fiat}`
                  : `PARA ${baseFiat.fiat}`}
              </span>
              <div className="text-xs text-gray-300">
                {fiatNames[baseFiat.fiat]}
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center gap-3">
            <ReactCountryFlag
              countryCode={fiatFlags[baseFiat.fiat]}
              svg
              style={{ fontSize: "2em" }}
            />

            <div className="flex flex-col items-center">
              <span className="text-cyan-300 drop-shadow-[0_0_6px_#1bcfff]">
                {mode === "desde"
                  ? `DESDE ${baseFiat.fiat}`
                  : `PARA ${baseFiat.fiat}`}
              </span>
              <div className="text-xs text-gray-300">
                {fiatNames[baseFiat.fiat]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop tooltip */}
      <div className="hidden md:block text-xs text-cyan-200 opacity-70 mt-1">
        Click para cambiar a {mode === "desde" ? "Para" : "Desde"}
      </div>
    </div>
  );
};

export default NeonModeSwitchFlag;
