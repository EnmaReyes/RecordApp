import React from "react";

const ClientCalculator = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center text-white mt-10">
        Calculadora de Divisas
      </h1>
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-dark/50 rounded-lg shadow-lg">
        <p className="text-white text-center">
          Esta es una calculadora de divisas simple. Aquí puedes calcular
          conversiones entre diferentes monedas basadas en tasas de cambio
          actuales.
        </p>
      </div>
    </div>
  );
};

export default ClientCalculator;
