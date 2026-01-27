import { useState, useMemo, useEffect } from "react";
import {
  calculateGeneral,
  calculateCOPtoFiat,
} from "../../utils/exchangeRates";
import { useCurrencies } from "../../context/CurrencyProvider";
import { useThousandsInput } from "../../utils/calcs";
import Marginrates from "../Marginrates";

/* ------------------ Utils ------------------ */
const formatNumber = (num = 0) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

/* ------------------ Debounce Hook ------------------ */
const useDebounce = (value, delay = 200) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

/* ------------------ Calculator ------------------ */
export const Calculator = ({ from, to }) => {
  const { currencies } = useCurrencies();

  const amountInput = useThousandsInput();
  const [mode, setMode] = useState("receive");
  const [copied, setCopied] = useState(false);

  const [fromFiat, setFromFiat] = useState(from ?? "");
  const [toFiat, setToFiat] = useState(to ?? "");

  /* ------------------ Margin (CONTROLADO) ------------------ */
  const getDefaultMargin = (fiat) => (fiat === "BRL" ? 7 : 10);

  const [margin, setMargin] = useState(getDefaultMargin(fromFiat));
  const debouncedMargin = useDebounce(margin, 180);

  // Reset margin cuando cambia la moneda base
  useEffect(() => {
    setMargin(getDefaultMargin(fromFiat));
  }, [fromFiat]);

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

  /* ------------------ RESULT ------------------ */
  const result = useMemo(() => {
    const value = Number(amountInput.rawValue);
    if (!value || !rate) return 0;

    if (mode === "receive") {
      return fromFiat === "COP" ? value / rate : value * rate;
    }

    return fromFiat === "COP" ? value * rate : value / rate;
  }, [amountInput.rawValue, rate, mode, fromFiat]);

  /* ------------------ Actions ------------------ */
  const handleCopy = () => {
    navigator.clipboard.writeText(formatNumber(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="relative max-w-[360px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl text-white">
      <div className="space-y-4">
        {/* FROM → TO */}
        <div className="flex items-center justify-center gap-3">
          {[fromFiat, toFiat].map((value, i) => (
            <div key={i} className="relative">
              <select
                value={value}
                onChange={(e) =>
                  i === 0
                    ? setFromFiat(e.target.value)
                    : setToFiat(e.target.value)
                }
                className="appearance-none bg-[#0f2547]/80 border border-cyan-400/20 text-cyan-200 font-semibold px-4 py-2 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 cursor-pointer"
              >
                <option value="">{i === 0 ? "Desde" : "Hacia"}</option>
                {currencies.map((c) => (
                  <option key={c.fiat} value={c.fiat}>
                    {c.fiat}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 text-sm">
                ▼
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-sky-900/40 rounded-xl p-4 text-center">
          <input
            ref={amountInput.ref}
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amountInput.value}
            onChange={amountInput.onChange}
            className="w-full bg-transparent text-3xl text-cyan-300 text-center outline-none"
          />
        </div>

        {/* Mode */}
        <div className="bg-white/5 rounded-xl p-1 flex">
          {["receive", "send"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm transition ${
                mode === m
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {m === "receive" ? "Cuánto recibir" : "Cuánto enviar"}
            </button>
          ))}
        </div>

        {/* Rate + Margin */}
        {rate && (
          <div className="text-center text-cyan-200 space-y-2">
            <p className="text-sm">Tasa aplicada</p>
            <p className="text-lg font-semibold">{rate.toFixed(4)}</p>

            <Marginrates margin={margin} onChangeMargin={setMargin} />
          </div>
        )}

        {/* Result */}
        <div className="bg-white/5 rounded-xl p-4 text-center relative">
          <p className="text-sm text-white mb-1">
            {mode === "receive" ? "Recibirás:" : "Enviarás:"}
          </p>

          <p className="text-2xl font-semibold text-cyan-300">
            {formatNumber(result)}
          </p>
          <p className="text-xs text-white mb-1">
            {mode === "receive" ? toFiat : fromFiat}
          </p>

          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-xs bg-sky-500/80 px-3 py-1 rounded-lg transition hover:bg-sky-500"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
};
