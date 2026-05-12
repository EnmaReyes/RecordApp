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
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";

const ExchangeBox = () => {
  const { currencies, loading } = useCurrencies();
  const [calculatedRates, setCalculatedRates] = useState([]);
  const [modes, setModes] = useState({});
  const [visibleFiat, setVisibleFiat] = useState(null);

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
  const ratesForWhatsApp = useMemo(() => {
    const map = {};

    // función auxiliar para buscar la tasa en calculatedRates
    const getRate = (from, to) => {
      const found = calculatedRates.find((r) => r.from === from && r.to === to);
      return found ? found.rate : null;
    };

    // asignar claves específicas
    map.COL = getRate("COP", "VES");
    map.MEX = getRate("MXN", "VES");
    map.PER = getRate("PEN", "VES");
    map.CHL = getRate("CLP", "VES");
    map.BRA = getRate("BRL", "VES");
    map.ARG = getRate("ARS", "VES");
    map.ESP = getRate("EUR", "VES");
    map.URU = getRate("UYU", "VES");
    map.USD = getRate("USD", "VES");
    map.VEN_COL = getRate("VES", "COP");

    return map;
  }, [calculatedRates]);

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

  const handleToggleVisible = (fiat) => {
    setVisibleFiat((prev) => (prev === fiat ? null : fiat));
  };
  const handleModeChange = (fiat, newMode) => {
    setModes((prev) => ({ ...prev, [fiat]: newMode }));
  };
  return (
    <div id="tasas" className="flex flex-col justify-center gap-5 w-max">
      {currencies.map((baseFiat) => (
        <div key={baseFiat.id} id={baseFiat.fiat}>
          <div className="flex md:flex-row flex-col justify-center items-center w-full md:mb-8 mb-4">
            <div className="flex flex-col items-center gap-4 text-xl font-bold text-white">
              <NeonModeSwitchFlag
                mode={modes[baseFiat.fiat] || ""}
                setMode={(newMode) => handleModeChange(baseFiat.fiat, newMode)}
                baseFiat={baseFiat}
                fiatFlags={fiatFlags}
                fiatNames={fiatNames}
              />
              <div
                className="text-3xl cursor-pointer flex items-center justify-center 
             transition-transform duration-200 hover:scale-110 
             text-cyan-400 hover:text-cyan-300"
              >
                {visibleFiat === baseFiat.fiat ? (
                  <IoIosArrowDropupCircle
                    onClick={() => handleToggleVisible(baseFiat.fiat)}
                    className="drop-shadow-md"
                  />
                ) : (
                  <IoIosArrowDropdownCircle
                    onClick={() => handleToggleVisible(baseFiat.fiat)}
                    className="drop-shadow-md"
                  />
                )}
              </div>
            </div>
            {visibleFiat === baseFiat.fiat && (
              <div className="md:absolute md:right-60 mt-2 md:mt-0">
                <CopyRatesButton
                  baseFiat={baseFiat.fiat}
                  mode={modes[baseFiat.fiat] || ""}
                  allPairs={allPairs}
                  calculatedRates={calculatedRates}
                />
              </div>
            )}
          </div>

          {/* 🧩 GRID DE CARDS */}
          {visibleFiat === baseFiat.fiat && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
              {allPairs
                .filter((pair) =>
                  (modes[baseFiat.fiat] || "") === "para"
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
          )}
        </div>
      ))}

      <WhatsAppButton rates={ratesForWhatsApp} />
    </div>
  );
};

export default ExchangeBox;
