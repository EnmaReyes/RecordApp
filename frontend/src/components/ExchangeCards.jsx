import React, { useState, useMemo } from "react";
import {
  calculateGeneral,
  calculateCOPtoVES,
  formatRate,
} from "../utils/exchangeRates";

export default function ExchangeCard({
  from,
  to,
  buyPrice,
  sellPrice,
  baseBuy,
  baseSell,
  type = 1,
  initialMargin = 8,
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

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-700 w-[260px]">
      <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mb-2">
        <span>{from}</span>
        <span>→</span>
        <span>{to}</span>
      </div>

      <h2 className="text-xl font-bold text-cyan-400 text-center mb-1">
        {formatRate(rate, 6)}
      </h2>
      <p className="text-center text-sm text-slate-400 mb-4">
        1 {from} = {formatRate(rate, 6)} {to}
      </p>

      <div className="text-xs text-slate-400 mb-4">
        <p>Buy: {formatRate(buyPrice, 4)}</p>
        <p>Sell: {formatRate(baseSell, 4)}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-300">Profit Margin</p>
        <input
          type="range"
          min="0"
          max="20"
          step="0.1"
          value={margin}
          onChange={(e) => setMargin(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm">{margin.toFixed(1)} %</span>
        </div>
      </div>
    </div>
  );
}
