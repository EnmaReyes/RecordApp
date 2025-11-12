import React from "react";
import { useCurrencies } from "../context/CurrencyProvider.jsx";
import ExchangeCard from "./ExchangeCards.jsx";
import ReactCountryFlag from "react-country-flag";

const ExchangeBox = () => {
  const { currencies, loading } = useCurrencies();

  const fiatFlags = {
    USD: "US",
    EUR: "EU",
    CLP: "CL",
    COP: "CO",
    ARS: "AR",
    VES: "VE",
    MXN: "MX",
    UYU: "UY",
    BRL: "BR",
    PEN: "PE",
  };

  const fiatNames = {
    USD: "US Dollar",
    EUR: "Euro",
    CLP: "Pesos chilenos",
    COP: "Pesos colombianos",
    ARS: "Pesos argentinos",
    VES: "Bolívares venezolanos",
    MXN: "Pesos mexicanos",
    UYU: "Pesos uruguayos",
    BRL: "Reales brasileños",
    PEN: "Soles peruanos",
  };
  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (!currencies || currencies.length === 0)
    return <p>No currencies loaded</p>;

  // 🔁 Generar todas las combinaciones posibles from → to
  const allPairs = [];
  for (const dataFrom of currencies) {
    for (const dataTo of currencies) {
      if (dataFrom.fiat === dataTo.fiat) continue; // evitar pares iguales
      allPairs.push({
        from: dataFrom.fiat,
        to: dataTo.fiat,
        buyPrice: dataFrom.buyPrice,
        sellPrice: dataFrom.sellPrice,
        baseBuy: dataTo.buyPrice,
        baseSell: dataTo.sellPrice,
      });
    }
  }

  return (
    <div id="ExchangeBox" className="flex flex-col justify-center gap-5 w-max">
      {currencies.map((baseFiat) => (
        <div key={baseFiat.id}>
          <div className="flex items-center justify-center w-full my-6">
            {/* Línea izquierda */}
            <div className="flex-1 h-px bg-aqua-gradient" />

            {/* Bloque central */}
            <div className="mx-4 px-6 py-2 rounded-full border border-1 border-primary/35 bg-dark flex items-center gap-2 shadow-md">
              <ReactCountryFlag
                countryCode={fiatFlags[baseFiat.fiat]}
                svg
                style={{ fontSize: "2em", marginRight: "0.3em" }}
              />
              <div className="flex flex-col items-center text-white leading-tight">
                <span className="text-sm font-semibold">Para {baseFiat.fiat}</span>
                <span className="text-xs text-gray-200">
                  {fiatNames[baseFiat.fiat]}
                </span>
              </div>
            </div>

            {/* Línea derecha */}
            <div className="flex-1 h-px bg-aqua-gradient" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {allPairs
              .filter((pair) => pair.to === baseFiat.fiat)
              .map((pair) => (
                <ExchangeCard
                  key={`${pair.from}-${pair.to}`}
                  from={pair.from}
                  to={pair.to}
                  buyPrice={pair.buyPrice}
                  sellPrice={pair.sellPrice}
                  baseBuy={pair.baseBuy}
                  baseSell={pair.baseSell}
                  initialMargin={9}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExchangeBox;
