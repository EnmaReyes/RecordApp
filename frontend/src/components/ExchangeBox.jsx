import React, { useState, useMemo } from "react";
import { useCurrencies } from "../context/CurrencyProvider.jsx";
import ExchangeCard from "./ExchangeCards.jsx";
import WhatsAppButton from "./WhatsAppButton.jsx";
import NeonModeSwitchFlag from "./FromSwitchTo.jsx";
import { CopyRatesButton } from "./CopyRatesButton.jsx";
import {
  calculateGeneral,
  calculateCOPtoFiat,
} from "../utils/exchangeRates.js";
import { useCallback } from "react";

const ExchangeBox = () => {
  const { currencies, loading } = useCurrencies();
  const [calculatedRates, setCalculatedRates] = useState([]);
  const [mode, setMode] = useState("");
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
    PAN: "PA",
    ECU: "EC",
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
    PAN: "Panama USD",
    ECU: "Ecuador USD",
  };
  //console.log("datacurrencies", currencies);

  const handleRateCalculated = useCallback(({ from, to, rate }) => {
    setCalculatedRates((prev) => {
      const existing = prev.find((r) => r.from === from && r.to === to);

      if (existing && existing.rate === rate) {
        return prev;
      }

      if (existing) {
        return prev.map((r) =>
          r.from === from && r.to === to ? { from, to, rate } : r,
        );
      }

      return [...prev, { from, to, rate }];
    });
  }, []);

  /* ===== Calcular rates para WhatsApp directamente ===== */
  const calculateWhatsAppRates = useMemo(() => {
    const getRate = (fromFiat, toFiat, margin = 0.1) => {
      const fromCurrency = currencies.find((c) => c.fiat === fromFiat);
      const toCurrency = currencies.find((c) => c.fiat === toFiat);

      if (!fromCurrency || !toCurrency) return null;

      if (fromFiat === "COP") {
        return calculateCOPtoFiat(
          fromCurrency.buyPrice,
          toCurrency.sellPrice,
          margin,
        );
      }

      return calculateGeneral(
        toCurrency.sellPrice,
        fromCurrency.buyPrice,
        margin,
      );
    };

    return {
      COL: getRate("COP", "VES"),
      MEX: getRate("MXN", "VES"),
      PER: getRate("PEN", "VES"),
      CHL: getRate("CLP", "VES"),
      BRA: getRate("BRL", "VES"),
      ARG: getRate("ARS", "VES"),
      ESP: getRate("EUR", "VES"),
      URU: getRate("UYU", "VES"),
      USD: getRate("USD", "VES"),
      VEN_COL: getRate("VES", "COP"),
    };
  }, [currencies]);

  if (loading || currencies.length === 0)
    return <p className="text-center text-white">Loading...</p>;
  const allPairs = [];
  for (const dataFrom of currencies) {
    for (const dataTo of currencies) {
      if (dataFrom.fiat === dataTo.fiat) continue;
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

  // extraer solo las tasas necesarias para WhatsApp
  const ratesForWhatsApp = calculateWhatsAppRates;

  return (
    <div id="tasas" className="flex flex-col justify-center gap-5 w-max">
      {currencies.map((baseFiat) => (
        <div key={baseFiat.id} id={baseFiat.fiat}>
          <div className="flex md:flex-row flex-col justify-center items-center w-full md:mb-8 mb-4">
            <NeonModeSwitchFlag
              mode={mode}
              setMode={setMode}
              baseFiat={baseFiat}
              fiatFlags={fiatFlags}
              fiatNames={fiatNames}
            />

            <div className="md:absolute md:right-60 mt-2 md:mt-0">
              <CopyRatesButton
                baseFiat={baseFiat.fiat}
                mode={mode}
                allPairs={allPairs}
                calculatedRates={calculatedRates}
              />
            </div>
          </div>

          {/* 🧩 GRID DE CARDS */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {allPairs
              .filter((pair) =>
                mode === "para"
                  ? pair.to === baseFiat.fiat
                  : pair.from === baseFiat.fiat,
              )
              .map((pair) => (
                <ExchangeCard
                  key={`${pair.from}-${pair.to}`}
                  from={pair.from}
                  to={pair.to}
                  buyPrice={pair.buyPrice}
                  sellPrice={pair.sellPrice}
                  baseBuy={pair.baseBuy}
                  baseSell={pair.baseSell}
                  initialMargin={pair.from === "BRL" ? 7 : 9}
                  onRateCalculated={handleRateCalculated}
                />
              ))}
          </div>
        </div>
      ))}
      <WhatsAppButton rates={ratesForWhatsApp} />
    </div>
  );
};

export default ExchangeBox;
