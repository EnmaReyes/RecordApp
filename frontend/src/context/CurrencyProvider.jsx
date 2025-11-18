import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { calcSpread } from "../utils/calcSpread.js";

const CurrencyContext = createContext();
export const useCurrencies = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const urlDB = import.meta.env.VITE_URLDB;

  // ⚙️ Llama a la API para actualizar las DB
  const updateFromApi = async () => {
    try {
      await axios.get(apiUrl, {
        headers: { "Cache-Control": "no-cache" },
      });
    } catch (error) {
      console.error("❌ Error updating currencies from API:", error);
    }
  };

  // 💾 Obtiene los datos ya guardados en la DB

  const fetchFromDB = async () => {
    const fiatList = [
      "VES",
      "COP",
      "MXN",
      "PEN",
      "CLP",
      "ARS",
      "EUR",
      "BRL",
      "UYU",
      "USD",
    ];
    try {
      const response = await axios.get(urlDB, {
        headers: { "Cache-Control": "no-cache" },
      });

      const rawData = response.data.data || response.data;

      const formattedData = rawData
        .map((item) => ({
          ...item,
          spread: calcSpread(item.sellPrice, item.buyPrice),
        }))
        .sort((a, b) => {
          return fiatList.indexOf(a.fiat) - fiatList.indexOf(b.fiat);
        });

      setCurrencies(formattedData);
    } catch (error) {
      console.error("❌ Error fetching currencies from DB:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFromDB();
    setLoading(false);
  }, []);

  // 🔁 Carga completa: actualiza + trae
  const fetchData = async () => {
    setLoading(true);
    try {
      await updateFromApi();
      await fetchFromDB();
    } finally {
      setLoading(false);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currencies, loading, fetchData }}>
      {children}
    </CurrencyContext.Provider>
  );
};
