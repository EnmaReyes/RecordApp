import React, { useState, useMemo, useEffect } from "react";
import {
  calculateGeneral,
  calculateCOPtoFiat,
  formatRate,
} from "../utils/exchangeRates";
import { CopyRateButton } from "./CopyRatesButton";
import { useCurrencies } from "../context/CurrencyProvider.jsx";
import { IoCalculator } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Marginrates from "./Marginrates.jsx";

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
  const [calculatedRate, setCalculatedRate] = useState(4);
  const zeroCount = Math.max(1, Math.min(calculatedRate - 3, 3));
  const navigate = useNavigate();

  const rate = useMemo(() => {
    const marginDecimal = margin / 100;

    // ✅ Lógica especial: solo COP → VES usa calculateCOPtoFiat
    if (from === "COP") {
      return calculateCOPtoFiat(buyPrice, baseSell || baseBuy, marginDecimal);
    }

    // Todas las demás tasas usan calculateGeneral
    return calculateGeneral(baseSell, buyPrice, marginDecimal);
  }, [buyPrice, sellPrice, baseBuy, baseSell, margin, from, to]);

  useEffect(() => {
    if (rate != null) {
      onRateCalculated({ from, to, rate });
    }
  }, [rate, from, to, onRateCalculated]);

  const handleGoCalculator = () => {
    navigate("/calculator", {
      state: { from, to, rate },
    });
  };
  return (
    <div className="bg-white/5 text-white p-5 rounded-2xl shadow-xl border border-slate-700 w-[260px] text-center">
      <div className="flex items-center justify-between text-sm text-blue-300 mb-2">
        <IoCalculator size={30} cursor="pointer" onClick={handleGoCalculator} />
        <div className="flex items-center gap-1">
          <span className="font-bold">{from}</span>
          <span>→</span>
          <span className="font-bold">{to}</span>
        </div>
        <CopyRateButton from={from} to={to} rateValue={rate} />
      </div>
      <div className="flex flex-col justify-center text-center bg-primary/30 p-2 rounded-lg gap-0.5 mb-2">
        <h2 className="text-2xl font-bold text-cyan-400 text-center mb-1">
          {formatRate(rate, calculatedRate)}
        </h2>

        <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mx-auto py-2">
          <button
            className="w-9 h-9 flex items-center justify-center bg-primary/30 rounded-lg text-white font-bold transition button"
            onClick={() => setCalculatedRate((prev) => prev - 1)}
            disabled={calculatedRate <= 1}
          >
            −
          </button>

          <p className="min-w-[60px] text-center text-lg font-bold text-white/85">
            {`.0` + "0".repeat(zeroCount)}
          </p>

          <button
            className="w-9 h-9 flex items-center justify-center bg-primary/30 rounded-lg text-white font-bold transition button"
            onClick={() => setCalculatedRate((prev) => prev + 1)}
            disabled={calculatedRate >= 8}
          >
            +
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-200 border border-slate-700 p-2 rounded-lg mb-4">
        <p>
          {from} Buy: {formatRate(buyPrice, 2)}
        </p>
        <p>
          {to} Sell: {formatRate(baseSell, 2)}
        </p>
      </div>

      <Marginrates margin={margin} onChangeMargin={setMargin} />
    </div>
  );
}
