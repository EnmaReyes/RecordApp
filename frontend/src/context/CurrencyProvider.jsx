import React, { useState, useEffect } from "react";
import axios from "axios";

export default function useCurrencies() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ⚙️ Actualiza la base desde la API externa
  const updateFromApi = async () => {
    try {
      await axios.get("http://localhost:3000/prices/update/", {
        headers: { "Cache-Control": "no-cache" },
      });
    } catch (error) {
      console.error("❌ Error updating currencies from API:", error);
    }
  };

  // 💾 Obtiene los datos ya guardados en la DB
  const fetchFromDB = async () => {
    try {
      const response = await axios.get("http://localhost:3000/prices/", {
        headers: { "Cache-Control": "no-cache" },
      });

      const rawData = response.data.data || response.data;

      const formattedData = rawData.map((item) => ({
        ...item,
        spread: calcSpread(item.sellPrice, item.buyPrice),
      }));

      setCurrencies(formattedData);

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch (error) {
      console.error("❌ Error fetching currencies from DB:", error);
    }
  };

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
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ currencies, loading, lastUpdated, fetchData }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
