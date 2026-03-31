import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { calcSpread } from "../utils/calcs.js";

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
  buyMethods: item.buy_methods || [],
  sellMethods: item.sell_methods || [],
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL; // /prices/update
  const urlDB = import.meta.env.VITE_URLDB; // /prices
  const BaseUrl = import.meta.env.VITE_BASE_URL; // http://localhost:3000
  // 🔐 Estado de autenticación
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("jwt");
    const id = localStorage.getItem("id");
    const role = localStorage.getItem("role");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const photo = localStorage.getItem("photo");
    const companyName = localStorage.getItem("companyName");
    const email = localStorage.getItem("email");

    return token
      ? { token, id, role, firstName, lastName, photo, companyName, email }
      : null;
  });

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
    "PAN",
    "ECU",
  ];

  // 🔄 Actualiza DB desde API externa
  const updateFromApi = async () => {
    try {
      await axios.get(apiUrl, { headers: { "Cache-Control": "no-cache" } });
    } catch (error) {
      console.error("❌ Error updating currencies from API:", error);
    }
  };

  // 🔄 Actualiza UN fiat
  const updateOneFiatApi = async (fiat) => {
    try {
      await axios.get(`${apiUrl}/${fiat}`, {
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
          .sort(
            (a, b) => fiatOrder.indexOf(a.fiat) - fiatOrder.indexOf(b.fiat),
          ),
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
      () => window.matchMedia(query).matches,
    );

    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  };

  // 🔐 Login
  const login = ({
    token,
    id,
    role,
    firstName,
    lastName,
    photo,
    companyName,
    email,
  }) => {
    localStorage.setItem("jwt", token);
    localStorage.setItem("id", id);
    localStorage.setItem("role", role);
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("photo", photo);
    localStorage.setItem("companyName", companyName || "");
    localStorage.setItem("email", email || "");

    setAuth({
      token,
      id,
      role,
      firstName,
      lastName,
      photo,
      companyName,
      email,
    });
  };

  // 🔐 Logout
  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("photo");
    localStorage.removeItem("companyName");
    localStorage.removeItem("email");
    setAuth(null);
  };

  // ✏️ Actualizar datos de usuario (admin o user)
  const updateUser = async (id, updatedData) => {
    try {
      const response = await axios.patch(
        `${BaseUrl}/api/users/${id}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );

      const data = response.data;

      // Actualizamos localStorage con los valores normalizados
      localStorage.setItem("firstName", data.first_name);
      localStorage.setItem("lastName", data.last_name);
      localStorage.setItem("photo", data.photo);
      localStorage.setItem("companyName", data.company_name || "");
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);
      localStorage.setItem("id", data.id);

      // Actualizamos estado global de auth
      setAuth({
        token: auth.token,
        id: data.id,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        photo: data.photo,
        companyName: data.company_name || "",
        email: data.email,
      });

      return data;
    } catch (error) {
      console.error("❌ Error actualizando usuario:", error);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        loading,
        fetchData,
        updateOneFiatApi,
        useMediaQuery,
        auth,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
