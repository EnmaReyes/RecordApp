import { useState } from "react";
import { Calculator } from "./Calculatotr";
import { CalculatorStepper } from "./CalculatorStepper";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrencies } from "../../context/CurrencyProvider";

export const ExchangeCalculator = () => {
  const { state } = useLocation();
  const { currencies, loading } = useCurrencies();

  if (loading) return null;

  // 1️⃣ FROM y TO (state tiene prioridad)
  const from = state?.from ?? "COP";
  const to = state?.to ?? "VES";
  const rate = state?.rate;

  return (
    <section
      id="calculator"
      className="w-full max-w-7xl mx-auto px-4 py-8 mb-6 flex flex-col-reverse lg:flex-row items-center justify-center gap-16 lg:gap-12"
    >
      {/* Stepper */}
      <div className="w-full lg:w-1/2 flex justify-center">
        <CalculatorStepper />
      </div>

      {/* Calculator */}
      <div className="w-full lg:w-1/2 flex justify-center">
        <Calculator from={from} to={to} rate={rate} />
      </div>
    </section>
  );
};
