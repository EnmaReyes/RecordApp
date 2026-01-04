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

  const updateOneFiatApi = async (fiat) => {
    try {
      await axios.get(`${apiUrl}?fiat=${fiat}`, {
        headers: { "Cache-Control": "no-cache" },
      });
    } catch (error) {
      console.error(`❌ Error updating ${fiat} from API:`, error);
    }

    try {
      const response = await axios.get(`${urlDB}/${fiat}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      const updated = response.data.data || response.data;

      const spreadCurrency = {
        ...updated,
        spread: calcSpread(updated.sellPrice, updated.buyPrice),
      };

      // 3️⃣ Reemplaza SOLO ese fiat dentro del estado
      setCurrencies((prev) => {
        const replaced = prev.map((c) =>
          c.fiat === fiat ? spreadCurrency : c
        );

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

        return replaced.sort(
          (a, b) => fiatList.indexOf(a.fiat) - fiatList.indexOf(b.fiat)
        );
      });
    } catch (error) {
      console.error(`❌ Error fetching ${fiat} from DB:`, error);
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
  // 🚀 Al montar, trae los datos de la DB
  useEffect(() => {
    const fetchDBData = async () => {
      try {
        await fetchFromDB();
      } catch (error) {
        console.error("❌ Error fetching initial currencies from DB:", error);
      }
    };

    fetchDBData();
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
