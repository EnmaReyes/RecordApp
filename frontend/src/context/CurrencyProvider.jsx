import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { calcSpread } from "../utils/calcSpread.js";

const CurrencyContext = createContext();
export const useCurrencies = () => useContext(CurrencyContext);

/**
 * 🔁 Normaliza datos del backend (snake_case → camelCase)
 */
const normalizeCurrency = (item) => ({
  id: item.id,
  fiat: item.fiat,

  buyPrice: item.buy_price,
  sellPrice: item.sell_price,

  buyMin: item.buy_min,
  sellMin: item.sell_min,
  buyMax: item.buy_max,
  sellMax: item.sell_max,

  buyMethods: item.buy_methods || [],
  sellMethods: item.sell_methods || [],

  buyAdvertiser: item.buy_advertiser,
  sellAdvertiser: item.sell_advertiser,

  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL; // /prices/update
  const urlDB = import.meta.env.VITE_URLDB; // /prices

  const fiatOrder = [
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

  // 🔄 Actualiza DB desde API externa
  const updateFromApi = async () => {
    try {
      await axios.get(apiUrl, {
        headers: { "Cache-Control": "no-cache" },
      });
    } catch (error) {
      console.error("❌ Error updating currencies from API:", error);
    }
  };

  // 🔄 Actualiza UN fiat
  const updateOneFiatApi = async (fiat) => {
    try {
      await axios.get(`${apiUrl}?fiat=${fiat}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      const response = await axios.get(`${urlDB}/${fiat}`);
      const raw = response.data.data || response.data;

      const normalized = normalizeCurrency(raw);

      const updated = {
        ...normalized,
        spread: calcSpread(normalized.sellPrice, normalized.buyPrice),
      };

      setCurrencies((prev) =>
        prev
          .map((c) => (c.fiat === fiat ? updated : c))
          .sort((a, b) => fiatOrder.indexOf(a.fiat) - fiatOrder.indexOf(b.fiat))
      );
    } catch (error) {
      console.error(`❌ Error updating ${fiat}:`, error);
    }
  };

  // 💾 Obtiene datos desde DB
  const fetchFromDB = async () => {
    try {
      const response = await axios.get(urlDB, {
        headers: { "Cache-Control": "no-cache" },
      });

      const rawData = response.data.data || response.data;

      const formatted = rawData
        .map((item) => {
          const normalized = normalizeCurrency(item);
          return {
            ...normalized,
            spread: calcSpread(normalized.sellPrice, normalized.buyPrice),
          };
        })
        .sort((a, b) => fiatOrder.indexOf(a.fiat) - fiatOrder.indexOf(b.fiat));

      setCurrencies(formatted);
    } catch (error) {
      console.error("❌ Error fetching currencies from DB:", error);
    }
  };

  // 🚀 Al montar
  useEffect(() => {
    fetchFromDB();
  }, []);

  // 🔁 Refetch completo
  const fetchData = async () => {
    setLoading(true);
    try {
      await updateFromApi();
      await fetchFromDB();
    } finally {
      setLoading(false);
    }
  };

  // 📱 Media Query helper
  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(
      () => window.matchMedia(query).matches
    );

    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        loading,
        fetchData,
        updateOneFiatApi,
        useMediaQuery,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
