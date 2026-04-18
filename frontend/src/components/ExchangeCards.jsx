import React, { useState, useMemo, useEffect } from "react";
import {
  calculateGeneralRaw,
  calculateCOPtoFiatRaw,
  formatRate,
} from "../utils/exchangeRates";
import { CopyRateButton } from "./CopyRatesButton";
import { IoCalculator } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Marginrates from "./Marginrates.jsx";
import { RoleGuard } from "./GoogleLogin/PrivateRoute.jsx";

export default function ExchangeCard({
  from,
  to,
  buyPrice,
  sellPrice,
  baseBuy,
  baseSell,
  type = 1,
  initialMargin,
  onRateCalculated,
}) {
  const [margin, setMargin] = useState(initialMargin);
  const [calculatedRate, setCalculatedRate] = useState(null);
  const navigate = useNavigate();

  const rate = useMemo(() => {
    const marginDecimal = margin / 100;

    // ✅ Lógica especial: solo COP → VES usa calculateCOPtoFiatRaw
    if (from === "COP") {
      return calculateCOPtoFiatRaw(
        buyPrice,
        baseSell || baseBuy,
        marginDecimal,
      );
    }

    // Todas las demás tasas usan calculateGeneralRaw
    return calculateGeneralRaw(baseSell, buyPrice, marginDecimal);
  }, [buyPrice, sellPrice, baseBuy, baseSell, margin, from, to]);

  // El rate ya es un número sin formatear
  const rateNumeric = rate;

  // Determinar calculatedRate inicial basado en la lógica de formatRate
  const initialCalculatedRate = useMemo(() => {
    if (!rateNumeric || isNaN(rateNumeric)) return 2;

    if (rateNumeric < 0.009) {
      return 3;
    }
    if (rateNumeric < 0.9) {
      return 3;
    }
    return 2;
  }, [rateNumeric]);

  // Usar el estado inicial calculado
  useEffect(() => {
    if (calculatedRate === null) {
      setCalculatedRate(initialCalculatedRate);
    }
  }, [initialCalculatedRate, calculatedRate]);

  // Formatear rate con decimales dinámicos basado en calculatedRate
  const displayRate = useMemo(() => {
    if (!rateNumeric || isNaN(rateNumeric) || calculatedRate === null)
      return "-";

    if (rateNumeric < 0.01) {
      return rateNumeric.toPrecision(calculatedRate).toString();
    }

    return rateNumeric.toFixed(calculatedRate);
  }, [rateNumeric, calculatedRate]);

  // Calcular cantidad de ceros para mostrar
  const zeroCount =
    calculatedRate !== null ? Math.max(1, Math.min(calculatedRate - 1, 3)) : 1;

  useEffect(() => {
    if (rate != null) {
      onRateCalculated({ from, to, rate: formatRate(rate) });
    }
  }, [rate, from, to, onRateCalculated]);

  const handleGoCalculator = () => {
    navigate("/calculator", {
      state: { from, to, rate: formatRate(rate) },
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
          {displayRate}
        </h2>

        <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mx-auto py-2">
          <button
            className="w-9 h-9 flex items-center justify-center bg-primary/30 rounded-lg text-white font-bold transition button"
            onClick={() => setCalculatedRate((prev) => Math.max(prev - 1, 1))}
            disabled={calculatedRate <= 1}
          >
            −
          </button>

          <p className="min-w-[60px] text-center text-lg font-bold text-white/85">
            {`.0` + "0".repeat(zeroCount)}
          </p>

          <button
            className="w-9 h-9 flex items-center justify-center bg-primary/30 rounded-lg text-white font-bold transition button"
            onClick={() => setCalculatedRate((prev) => Math.min(prev + 1, 8))}
            disabled={calculatedRate >= 8}
          >
            +
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-200 border border-slate-700 p-2 rounded-lg mb-4">
        <p>
          {from} Buy: {formatRate(parseFloat(buyPrice))}
        </p>
        <p>
          {to} Sell: {formatRate(parseFloat(baseSell))}
        </p>
      </div>
      <RoleGuard allowedRoles={["admin"]}>
        <Marginrates margin={margin} onChangeMargin={setMargin} />
      </RoleGuard>
    </div>
  );
}
