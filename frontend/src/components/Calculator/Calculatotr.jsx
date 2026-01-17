import { useState, useEffect } from "react";

const ONBOARDING_KEY = "calculator_onboarding_done";

const useOnboarding = () => {
  const [step, setStep] = useState(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    return done ? null : 0;
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

export const Calculator = ({ from, to, rate }) => {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("receive");
  const [copied, setCopied] = useState(false);
  const { step, next } = useOnboarding();

  const calculateResult = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0;
    return mode === "receive" ? value * rate : value / rate;
  };

  const formatNumber = (num) =>
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const handleCopy = () => {
    navigator.clipboard.writeText(calculateResult().toFixed(2));
    setCopied(true);
    if (step === 3) next();
    setTimeout(() => setCopied(false), 1200);
  };

  // Detectar interacción real
  useEffect(() => {
    if (amount && step === 0) next();
  }, [amount]);

  useEffect(() => {
    if (step === 1) next();
  }, [mode]);

  return (
    <div className="relative max-w-[360px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl text-white">
      {/* Hint overlay */}
      {step !== null && (
        <div className="absolute -top-12 left-0 right-0 text-center text-lg text-cyan-300 animate-fadeIn">
          {hints[step]}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          <span className="font-bold">{from}</span>
          <span>→</span>
          <span className="font-bold">{to}</span>
        </div>
        {/* Input */}
        <div className="bg-sky-900/40 rounded-xl p-4 mb-4 text-center">
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-3xl text-cyan-300 text-center outline-none"
          />
        </div>

        {/* Mode selector */}
        <div className="bg-white/5 rounded-xl p-1 flex mb-4">
          <button
            onClick={() => setMode("receive")}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === "receive" ? "bg-sky-500 text-white" : "text-slate-300"
            }`}
          >
            Cuánto recibir
          </button>

          <button
            onClick={() => setMode("send")}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === "send" ? "bg-sky-500 text-white" : "text-slate-300"
            }`}
          >
            Cuánto enviar
          </button>
        </div>

        {/* Rate */}
        <div className="text-xs text-center text-cyan-200 mb-3">
          {from} = {rate} {to}
        </div>

        {/* Result */}
        <div className="bg-white/5 rounded-xl p-4 text-center relative">
          <p className="text-xs text-slate-400 mb-1">
            {mode === "receive" ? "Recibirás:" : "Enviarás:"}
          </p>

          <p className="text-2xl font-semibold text-cyan-300">
            {formatNumber(calculateResult())}
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

const hints = [
  "Ingresa el monto que deseas cambiar",
  "Elige cómo deseas calcular",
  "Este es el resultado en tiempo real",
  "Copia el monto y envíalo",
];
