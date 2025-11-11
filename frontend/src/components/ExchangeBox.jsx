import React from "react";
import { useCurrencies } from "../context/CurrencyProvider.jsx";
import ExchangeCard from "./ExchangeCards.jsx";

const ExchangeBox = () => {
  const { currencies, loading } = useCurrencies();

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
    <div className="flex flex-col justify-center gap-10 w-max">
      {currencies.map((baseFiat) => (
        <div key={baseFiat.id}>
          <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">
            {baseFiat.fiat} como moneda base
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 justify-items-center ">
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
