import React from "react";
import { useCurrencies } from "../context/CurrencyProvider";

const Marginrates = ({ margin, onChangeMargin }) => {
  const { useMediaQuery } = useCurrencies();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-300">Profit Margin</p>

      <div className="flex items-center justify-center">
        <span className="text-sm">{margin.toFixed(1)} %</span>
      </div>

      {isDesktop ? (
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={margin}
          onChange={(e) => onChangeMargin(+e.target.value)}
          className="w-full accent-cyan-400 cursor-pointer"
        />
      ) : (
        <div className="flex items-center justify-center gap-3">
          <button
            className="px-3 py-1 bg-primary/30 rounded text-white button"
            onClick={() => onChangeMargin((v) => Math.max(0, v - 0.5))}
          >
            −
          </button>

          <button
            className="px-3 py-1 bg-primary/30 rounded text-white button"
            onClick={() => onChangeMargin((v) => Math.min(20, v + 0.5))}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default Marginrates;
