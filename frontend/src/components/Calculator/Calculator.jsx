import { useState, useMemo, useEffect } from "react";
import {
  calculateGeneral,
  calculateCOPtoFiat,
  formatRate,
} from "../../utils/exchangeRates.js";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";
import Marginrates from "../Marginrates.jsx";
import CurrencySelector from "../../utils/CurrencySelector.jsx";
import { CopyCalculatorButton } from "../CopyRatesButton.jsx";
import { CgArrowsExchangeAltV } from "react-icons/cg";
/* ------------------ Utils ------------------ */
const formatNumber = (num = 0) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

const formatPrice = (price) => (price ? parseFloat(price).toFixed(2) : "0.00");

/* ------------------ Debounce Hook ------------------ */
const useDebounce = (value, delay = 200) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

export const Calculator = ({ from, to }) => {
  const { currencies } = useCurrencies();

  const [fromFiat, setFromFiat] = useState(from ?? "");
  const [toFiat, setToFiat] = useState(to ?? "");

  // Estados bidireccionales
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  /* ------------------ Margin (CONTROLADO) ------------------ */
  const getDefaultMargin = (fiat) => (fiat === "BRL" ? 7 : 9);

  const [margin, setMargin] = useState(getDefaultMargin(fromFiat));
  const debouncedMargin = useDebounce(margin, 180);

  useEffect(() => {
    setMargin(getDefaultMargin(fromFiat));
    setFromAmount("");
    setToAmount("");
  }, [fromFiat, toFiat]);

  /* ------------------ Monedas ------------------ */
  const fromCurrency = useMemo(
    () => currencies.find((c) => c.fiat === fromFiat),
    [currencies, fromFiat],
  );

  const toCurrency = useMemo(
    () => currencies.find((c) => c.fiat === toFiat),
    [currencies, toFiat],
  );

  /* ------------------ RATE ------------------ */
  const rate = useMemo(() => {
    if (!fromCurrency || !toCurrency) return null;

    const marginDecimal = debouncedMargin / 100;

    if (fromFiat === "COP") {
      return calculateCOPtoFiat(
        fromCurrency.buyPrice,
        toCurrency.sellPrice,
        marginDecimal,
      );
    }

    return calculateGeneral(
      toCurrency.sellPrice,
      fromCurrency.buyPrice,
      marginDecimal,
    );
  }, [fromCurrency, toCurrency, fromFiat, debouncedMargin]);

  /* --------- HANDLERS BIDIRECCIONALES --------- */
  const handleFromChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setFromAmount(value);

    if (rate && value) {
      const calculated = fromFiat === "COP" ? numValue / rate : numValue * rate;
      setToAmount(formatNumber(calculated));
    } else {
      setToAmount("");
    }
  };

  const handleToChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setToAmount(value);

    if (rate && value) {
      const calculated = fromFiat === "COP" ? numValue * rate : numValue / rate;
      setFromAmount(formatNumber(calculated));
    } else {
      setFromAmount("");
    }
  };

  const handleSwap = () => {
    setFromFiat(toFiat);
    setToFiat(fromFiat);
    setFromAmount("");
    setToAmount("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
            Conversor de Monedas
          </h2>
        </div>
      </div>

      {/* UNIFIED CARD - Sin bordes internos */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80 backdrop-blur-xl border border-cyan-400/20 overflow-hidden shadow-2xl text-white">
        {/* ===== TOP SECTION: FROM ===== */}
        <div className="p-6 md:p-8 border-b border-cyan-400/10 space-y-3">
          <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wide block">
            Enviar
          </label>

          <div className="flex items-center gap-3">
            {/* Moneda Selector */}
            <div className="relative flex-shrink-0 w-24">
              <CurrencySelector
                value={fromFiat}
                currencies={currencies}
                onChange={setFromFiat}
              />
            </div>

            {/* Amount Input */}
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => handleFromChange(e.target.value)}
              className="flex-1 bg-transparent border-0 text-right text-cyan-300 placeholder-cyan-300/30 font-bold py-2 outline-none focus:text-cyan-100 text-3xl"
            />
          </div>

          {/* Price Info */}
          {fromCurrency && (
            <div className="flex text-xs text-cyan-300/60">
              <span>Precio Compra: {formatPrice(fromCurrency.buyPrice)}</span>
            </div>
          )}
        </div>

        {/* ===== MIDDLE SECTION: SWAP & RATE ===== */}
        <div className="px-6 md:px-8 py-4 flex items-center justify-between border-b border-cyan-400/10">
          <button
            onClick={handleSwap}
            className="bg-gradient-to-r from-cyan-500/60 to-blue-500/60 hover:from-cyan-500 hover:to-blue-500 text-white px-3 py-1 rounded-full transition transform hover:scale-105 shadow-lg"
          >
            <CgArrowsExchangeAltV size={28} />
          </button>

          {rate && (
            <div className="text-center flex-1">
              <p className="text-xs text-cyan-300/70 mb-1">Tasa</p>
              <p className="text-xl font-bold text-cyan-300">
                {formatRate(rate)}
              </p>
            </div>
          )}

          {rate && toAmount && (
            <CopyCalculatorButton
              fromAmount={fromAmount}
              fromFiat={fromFiat}
              toAmount={toAmount}
              toFiat={toFiat}
              rate={rate}
            />
          )}
        </div>

        {/* ===== BOTTOM SECTION: TO ===== */}
        <div className="p-6 md:p-8 space-y-3">
          <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wide block">
            Recibir
          </label>
          <div className="flex items-center gap-3">
            {/* Moneda Selector */}
            <div className="relative flex-shrink-0 w-24">
              <CurrencySelector
                value={toFiat}
                currencies={currencies}
                onChange={setToFiat}
              />
            </div>

            {/* Amount Output */}
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={toAmount}
              onChange={(e) => handleToChange(e.target.value)}
              className="flex-1 bg-transparent border-0 text-right text-blue-300 placeholder-blue-300/30 font-bold py-2 outline-none focus:text-blue-100 text-3xl"
            />
          </div>
          {/* Price Info */}
          {toCurrency && (
            <div className="flex text-xs text-cyan-300/60">
              <span>Precio Venta: {formatPrice(toCurrency.sellPrice)}</span>
            </div>
          )}
        </div>

        {/* ===== MARGIN SECTION ===== */}
        {rate && (
          <div className="px-6 md:px-8 py-4 border-t border-cyan-400/10 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-cyan-300/70 font-semibold">
                Margen Aplicado
              </p>
              <p className="text-sm font-bold text-blue-300">{margin}%</p>
            </div>
            <Marginrates margin={margin} onChangeMargin={setMargin} />
          </div>
        )}

        {/* Footer Info */}
        <div className="text-xs text-cyan-300/60 text-center p-3 bg-white/5 border-t border-cyan-400/10">
          Tasas actualizadas cada minuto • Operador: RecordApp Exchange
        </div>
      </div>
    </div>
  );
};
