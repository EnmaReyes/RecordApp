import { useState } from "react";
import { Calculator } from "./Calculatotr";
import { CalculatorStepper } from "./CalculatorStepper";
import { Navigate, useLocation } from "react-router-dom";

export const ExchangeCalculator = () => {
  const { state } = useLocation();

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { from, to, rate } = state;

  return (
    <div
      className="flex flex-row justify-center align-center p-4 mt-6 gap-10"
      id="calculator"
    >
      <CalculatorStepper />
      <Calculator from={from} to={to} rate={rate} />
    </div>
  );
};
