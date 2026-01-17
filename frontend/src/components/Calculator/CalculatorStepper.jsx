import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    title: "Elige las monedas",
    description:
      "Selecciona la moneda que deseas enviar y la moneda que quieres recibir.",
    content: (
      <div className="flex justify-center gap-4 text-primary font-semibold">
        <span>Enviar</span>
        <span>→</span>
        <span>Recibir</span>
      </div>
    ),
  },
  {
    title: "¿Cómo deseas calcular?",
    description: "Elige si quieres saber cuánto recibir o cuánto debes enviar.",
    content: (
      <div className="flex flex-col gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-primary font-bold">Cuánto recibir</h3>
          <p className="text-sm text-white/70">
            Ingresa el monto a enviar y calcula lo que recibirás.
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-primary font-bold">Cuánto enviar</h3>
          <p className="text-sm text-white/70">
            Ingresa el monto que deseas recibir y calcula lo que debes enviar.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Copia el resultado",
    description:
      "Utiliza el botón copiar para enviar el monto exacto por WhatsApp.",
    content: (
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
        <p className="text-white/80 text-sm">
          Presiona <strong>Copiar</strong> y envía el resultado fácilmente.
        </p>
      </div>
    ),
  },
];

export const CalculatorStepper = () => {
  const [step, setStep] = useState(0);

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Indicador */}
      <div className="flex justify-between mb-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 mx-1 rounded-full transition-all ${
              index <= step ? "bg-primary" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="bg-white/5 rounded-2xl p-6 min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-primary/20 text-primary">
              Paso {step + 1}
            </span>

            <h2 className="text-xl font-semibold text-white">
              {steps[step].title}
            </h2>

            <p className="text-sm text-white/70">{steps[step].description}</p>

            {steps[step].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="px-4 py-2 rounded-lg bg-white/10 text-white/70 disabled:opacity-30"
        >
          Atrás
        </button>

        <button
          onClick={() => setStep(step + 1)}
          disabled={step === steps.length - 1}
          className="px-4 py-2 rounded-lg bg-primary text-black font-semibold disabled:opacity-30"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
