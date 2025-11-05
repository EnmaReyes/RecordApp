import React from "react";
import { FaClock } from "react-icons/fa";
import { useCurrencies } from "../context/CurrencyProvider";
import ReactCountryFlag from "react-country-flag";

const CurrencyTable = () => {
  const { currencies, loading, lastUpdated } = useCurrencies();
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

  if (loading && currencies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
        <p className="text-lg animate-pulse">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white/5 text-white rounded-3xl shadow-xl my-10 border border-white/10 p-4  ">
      <div className="w-[90%] md:w-4/5 lg:w-3/4 xl:w-[100%] rounded-3xl backdrop-blur-lg p-6 ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Currency Prices</h2>
          <div className="flex items-center text-sm text-gray-300">
            <FaClock className="mr-2" />
            <span>Última actualización: {lastUpdated}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-cyan-400 text-sm uppercase tracking-wide">
                <th className="py-2 px-4">Moneda</th>
                <th className="py-2 px-4">Compra</th>
                <th className="py-2 px-4">Venta</th>
                <th className="py-2 px-4">Spread</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((cur) => (
                <tr
                  key={cur.id}
                  className="bg-white/5 hover:bg-white/10 transition rounded-lg"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <ReactCountryFlag
                        countryCode={fiatFlags[cur.fiat]}
                        svg
                        style={{ fontSize: "2em", marginRight: "0.5em" }}
                      />
                      <div>
                        <div className="font-bold">{cur.fiat}</div>
                        <div className="text-gray-300 text-sm">
                          {fiatNames[cur.fiat]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{cur.buyPrice}</td>
                  <td className="py-3 px-4 font-mono">{cur.sellPrice}</td>
                  <td className="py-3 px-4 font-semibold text-cyan-400">
                    {cur.spread?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTable;
