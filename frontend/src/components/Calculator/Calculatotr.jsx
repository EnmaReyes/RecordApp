import { useState, useEffect, useMemo } from "react";
import {
  calculateGeneral,
  calculateCOPtoFiat,
} from "../../utils/exchangeRates";
import { useCurrencies } from "../../context/CurrencyProvider";
import { useThousandsInput } from "../../utils/calcs";

/* ------------------ Onboarding ------------------
const ONBOARDING_KEY = "calculator_onboarding_done";

const useOnboarding = () => {
  const [step, setStep] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) ? null : 0;
  });

  const next = () => {
    setStep((prev) => {
      if (prev === null) return null;
      if (prev >= 3) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        return null;
      }
      return prev + 1;
    });
  };

  return { step, next };
};
 */
/* ------------------ Utils ------------------ */
const formatNumber = (num = 0) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

/* ------------------ Calculator ------------------ */
export const Calculator = ({ from, to }) => {
  const { currencies, loading } = useCurrencies();
  /*const { step, next } = useOnboarding();*/

  const amountInput = useThousandsInput();
  const [mode, setMode] = useState("receive");
  const [copied, setCopied] = useState(false);

  const [fromFiat, setFromFiat] = useState(from ?? "");
  const [toFiat, setToFiat] = useState(to ?? "");

  /* ------------------ Monedas ------------------ */
  const fromCurrency = currencies.find((c) => c.fiat === fromFiat);
  const toCurrency = currencies.find((c) => c.fiat === toFiat);

  /* ------------------ Config ------------------ */
  const margin = fromFiat === "BRL" ? 0.07 : 0.1;

  /* ------------------ RATE ------------------ */
  const rate = useMemo(() => {
    if (!fromCurrency || !toCurrency) return null;

    // Caso especial COP
    if (fromFiat === "COP") {
      return calculateCOPtoFiat(
        fromCurrency.buyPrice,
        toCurrency.sellPrice,
        margin,
      );
    }

    // Caso general
    return calculateGeneral(
      toCurrency.sellPrice,
      fromCurrency.buyPrice,
      margin,
    );
  }, [fromCurrency, toCurrency, fromFiat, margin]);

  /* ------------------ Resultado ------------------ */
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
    if (step === 3) next();
    setTimeout(() => setCopied(false), 1200);
  };

  /* ------------------ Onboarding triggers ------------------ 
  useEffect(() => {
    if (amountInput.rawValue && step === 0) next();
  }, [amountInput.rawValue, step, next]);

  useEffect(() => {
    if (step === 1) next();
  }, [mode, step, next]);

  if (loading) return null;
*/
  /* ------------------ UI ------------------ */
  return (
    <div className="relative max-w-[360px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl text-white">
     {/* {step !== null && (
        <div className="absolute -top-12 inset-x-0 text-center text-lg text-cyan-300 animate-fadeIn">
          {hints[step]}
        </div>
      )}*/}

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
              className={`flex-1 py-2 rounded-lg text-sm ${
                mode === m ? "bg-sky-500 text-white" : "text-slate-300"
              }`}
            >
              {m === "receive" ? "Cuánto recibir" : "Cuánto enviar"}
            </button>
          ))}
        </div>

        {/* Rate */}
        {rate && (
          <div className=" text-center text-cyan-200">
            <p className="text-sm">Tasa</p>
            <p className="text-lg titulo">{rate.toFixed(4)}</p>
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
            {mode === "receive" ? fromFiat : toFiat}
          </p>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-xs bg-sky-500/80 px-3 py-1 rounded-lg"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------ Hints ------------------ 
const hints = [
  "Selecciona las monedas",
  "Ingresa el monto",
  "Elige cómo deseas calcular",
  "Copia el resultado",
];
*/
