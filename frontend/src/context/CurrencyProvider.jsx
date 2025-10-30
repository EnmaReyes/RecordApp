import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const CurrencyContext = createContext();

// Hook personalizado
export const useCurrencies = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // 🔁 Función que trae los datos del backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // 👉 Cambia esta URL por la de tu API real
      const response = await axios.get("http://localhost:3000/prices/");

      setCurrencies(response.data);

      const now = new Date();
      const formatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLastUpdated(formatted);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar datos solo una vez al iniciar
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
};
