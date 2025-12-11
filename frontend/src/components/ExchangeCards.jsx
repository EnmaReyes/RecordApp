import React, { useState, useMemo, useEffect } from "react";
import {
  calculateGeneral,
  calculateCOPtoVES,
  formatRate,
} from "../utils/exchangeRates";
import { CopyRateButton } from "./CopyRatesButton";

export default function ExchangeCard({
  from,
  to,
  buyPrice,
  sellPrice,
  baseBuy,
  baseSell,
  type = 1,
  initialMargin = 8,
  onRateCalculated,
}) {
  const [margin, setMargin] = useState(initialMargin);

  const rate = useMemo(() => {
    const marginDecimal = margin / 100;

    // ✅ Lógica especial: solo COP → VES usa calculateCOPtoVES
    if (from === "COP" && to === "VES") {
      return calculateCOPtoVES(buyPrice, baseSell || baseBuy, marginDecimal);
    }

    // Todas las demás tasas usan calculateGeneral
    return calculateGeneral(baseSell, buyPrice, marginDecimal);
  }, [buyPrice, sellPrice, baseBuy, baseSell, margin, from, to]);

  useEffect(() => {
    if (onRateCalculated && rate) {
      onRateCalculated({ from, to, rate });
    }
  }, [rate, from, to, onRateCalculated]);
  return (
    <div className="bg-white/5 text-white p-5 rounded-2xl shadow-xl border border-slate-700 w-[260px] text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mb-2 relative">
        <span>{from}</span>
        <span>→</span>
        <span>{to}</span>

        <div className="absolute right-[-0.5rem] bottom-2">
          <CopyRateButton from={from} to={to} rateValue={rate} />
        </div>
      </div>
      <div className="flex flex-col justify-center text-center bg-primary/30 p-2 rounded-lg gap-0.5 mb-2">
        <h2 className="text-2xl font-bold text-cyan-400 text-center mb-1">
          {formatRate(rate, 4)}
        </h2>
        <p className="text-center text-sm text-white/85">
          1 {from} = {formatRate(rate, 4)} {to}
        </p>
      </div>

      <div className="text-xs text-slate-400 border border-slate-700 p-2 rounded-lg mb-4">
        <p>
          {from} Buy: {formatRate(buyPrice, 2)}
        </p>
        <p>
          {to} Sell: {formatRate(baseSell, 2)}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-300">Profit Margin</p>
        <div className="flex items-center justify-center">
          <span className="text-sm">{margin.toFixed(1)} %</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="0.1"
          value={margin}
          onChange={(e) => setMargin(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-3">
          <button
            className="px-3 py-1 bg-primary/30 rounded text-white button"
            onClick={() => setMargin((prev) => Math.max(0, prev - 0.5))}
          >
            -
          </button>

          <button
            className="px-3 py-1 bg-primary/30 rounded text-white button"
            onClick={() => setMargin((prev) => Math.min(20, prev + 0.5))}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
