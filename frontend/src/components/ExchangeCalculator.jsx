import { useState } from "react";

const RATE = 92.45; // ejemplo MXN → COP

export const ExchangeCalculator = () => {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("receive");
  const [copied, setCopied] = useState(false);

  const calculateResult = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0;

    return mode === "receive"
      ? value * RATE // MXN → COP
      : value / RATE; // COP → MXN
  };

  const formatNumber = (num) =>
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  const handleCopy = () => {
    navigator.clipboard.writeText(calculateResult().toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-[360px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl text-white">
        {/* Header */}
        <h2 className="text-center text-lg font-semibold text-cyan-300 mb-4">
          Cambio MXN ⇄ COP
        </h2>

        {/* Input */}
        <div className="bg-sky-900/40 rounded-xl p-4 mb-4 text-center">
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-3xl text-cyan-300 text-center outline-none placeholder:text-cyan-500"
          />
        </div>

        {/* Mode selector */}
        <div className="bg-white/5 rounded-xl p-1 flex mb-4">
          <button
            onClick={() => setMode("receive")}
            className={`flex-1 py-2 rounded-lg text-sm transition
              ${
                mode === "receive"
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:bg-white/10"
              }`}
          >
            Quiero saber cuántos COP recibo
          </button>

          <button
            onClick={() => setMode("send")}
            className={`flex-1 py-2 rounded-lg text-sm transition
              ${
                mode === "send"
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:bg-white/10"
              }`}
          >
            Quiero saber cuántos MXN envío
          </button>
        </div>

        {/* Rate info */}
        <div className="text-xs text-center text-cyan-200 mb-3">
          Tasa actual: 1 MXN = {RATE} COP
        </div>

        {/* Result */}
        <div className="bg-white/5 rounded-xl p-4 text-center relative overflow-hidden">
          <p className="text-xs text-slate-400 mb-1">Resultado</p>

          <p
            key={calculateResult()}
            className="text-2xl font-semibold text-cyan-300 animate-[fadeIn_0.3s_ease]"
          >
            {formatNumber(calculateResult())}
          </p>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-sm bg-sky-500/80 px-3 py-1 rounded-lg hover:bg-sky-400 transition"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};
