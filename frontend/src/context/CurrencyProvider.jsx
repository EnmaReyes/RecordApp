import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { calcSpread } from "../utils/calcs.js";

const CurrencyContext = createContext();
export const useCurrencies = () => useContext(CurrencyContext);

const normalizeCurrency = (item) => ({
  id: item.id,
  fiat: item.fiat,

  buyPrice: item.buyPrice ?? item.buy_price,
  sellPrice: item.sellPrice ?? item.sell_price,

  buyMin: item.buyMin ?? item.buy_min,
  buyMax: item.buyMax ?? item.buy_max,

  sellMin: item.sellMin ?? item.sell_min,
  sellMax: item.sellMax ?? item.sell_max,

  buyMethods: item.buyMethods ?? item.buy_methods ?? [],
  sellMethods: item.sellMethods ?? item.sell_methods ?? [],

  buyAdvertiser: item.buyAdvertiser ?? item.buy_advertiser,

  sellAdvertiser: item.sellAdvertiser ?? item.sell_advertiser,

  buyPosition: item.buyPosition ?? item.buy_position,

  sellPosition: item.sellPosition ?? item.sell_position,

  source: item.source,

  createdAt: item.createdAt ?? item.created_at,

  updatedAt: item.updatedAt ?? item.updated_at,
});

export const CurrencyProvider = ({ children }) => {
  // ============================================================
  // 💰 PRECIOS ACTUALES
  // ============================================================

  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 🕘 HISTORIAL
  // ============================================================

  // Lista liviana de snapshots para el selector
  const [snapshots, setSnapshots] = useState([]);

  // Precios del snapshot seleccionado
  const [historyPrices, setHistoryPrices] = useState([]);

  // Loading independiente del historial
  const [historyLoading, setHistoryLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const urlDB = import.meta.env.VITE_URLDB;
  const BaseUrl = import.meta.env.VITE_BASE_URL;

  // ============================================================
  // 🔐 ESTADO DE AUTENTICACIÓN
  // ============================================================

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
      ? {
          token,
          id,
          role,
          firstName,
          lastName,
          photo,
          companyName,
          email,
        }
      : null;
  });

  // ============================================================
  // 💱 ORDEN DE LAS MONEDAS
  // ============================================================

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

  // ============================================================
  // 🔄 ACTUALIZA DB DESDE API EXTERNA
  // ============================================================

  const updateFromApi = async () => {
    try {
      await axios.get(apiUrl, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("❌ Error updating currencies from API:", error);
    }
  };

  // ============================================================
  // 🔄 ACTUALIZA UN FIAT
  // ============================================================

  const updateOneFiatApi = async (fiat) => {
    try {
      await axios.get(`${apiUrl}/${fiat}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
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

  // ============================================================
  // 💾 OBTIENE PRECIOS ACTUALES DESDE DB
  // ============================================================

  const fetchFromDB = async () => {
    try {
      const response = await axios.get(urlDB, {
        headers: {
          "Cache-Control": "no-cache",
        },
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

  // ============================================================
  // 🕘 OBTENER LISTA DE SNAPSHOTS
  // ============================================================

  const fetchSnapshots = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/history`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const rawData = response.data.data || response.data;

      if (!Array.isArray(rawData)) {
        setSnapshots([]);
        return [];
      }

      /*
       * IMPORTANTE:
       *
       * Aquí NO guardamos "prices".
       *
       * Solo conservamos la información necesaria
       * para mostrar el selector de fecha/hora.
       */

      const formattedSnapshots = rawData.map((snapshot) => ({
        id: snapshot.id,
        snapshotId: snapshot.snapshotId,
        createdAt: snapshot.createdAt,
      }));

      setSnapshots(formattedSnapshots);

      return formattedSnapshots;
    } catch (error) {
      console.error("❌ Error fetching history snapshots:", error);

      setSnapshots([]);

      return [];
    }
  };

  // ============================================================
  // 🕘 OBTENER PRECIOS DE UN SNAPSHOT
  // ============================================================

  const fetchHistorySnapshot = async (snapshotId) => {
    if (!snapshotId) {
      setHistoryPrices([]);
      return [];
    }

    setHistoryLoading(true);

    try {
      const response = await axios.get(
        `${BaseUrl}/history/snapshot/${snapshotId}`,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      );

      const responseData = response.data;

      /*
       * El endpoint puede devolver:
       *
       * { data: {...} }
       *
       * o directamente:
       *
       * {...}
       *
       * o incluso:
       *
       * { data: [{...}] }
       */
      let raw = responseData?.data ?? responseData;

      if (Array.isArray(raw)) {
        raw = raw[0];
      }

      const prices = raw?.prices;

      if (!prices || typeof prices !== "object") {
        console.warn("⚠️ El snapshot no contiene prices:", snapshotId, raw);

        setHistoryPrices([]);
        return [];
      }

      const formatted = Object.values(prices)
        .map((item) => {
          const normalized = normalizeCurrency(item);

          return {
            ...normalized,
            spread: calcSpread(normalized.sellPrice, normalized.buyPrice),
          };
        })
        .sort((a, b) => fiatOrder.indexOf(a.fiat) - fiatOrder.indexOf(b.fiat));

      setHistoryPrices(formatted);

      return formatted;
    } catch (error) {
      console.error(`❌ Error fetching snapshot ${snapshotId}:`, error);

      setHistoryPrices([]);

      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  // ============================================================
  // 📅 OBTENER HISTORIAL POR FECHA
  // ============================================================

  const fetchHistoryByDate = async (date) => {
    if (!date) {
      setSnapshots([]);
      return [];
    }

    try {
      const response = await axios.get(`${BaseUrl}/history/date/${date}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const rawData = response.data.data || response.data;

      if (!Array.isArray(rawData)) {
        setSnapshots([]);
        return [];
      }

      const formattedSnapshots = rawData.map((snapshot) => ({
        id: snapshot.id,
        snapshotId: snapshot.snapshotId,
        createdAt: snapshot.createdAt,
      }));

      setSnapshots(formattedSnapshots);

      return formattedSnapshots;
    } catch (error) {
      console.error(`❌ Error fetching history for ${date}:`, error);

      setSnapshots([]);

      return [];
    }
  };

  // ============================================================
  // 🚀 AL MONTAR
  // ============================================================

  useEffect(() => {
    fetchFromDB();
  }, []);

  // ============================================================
  // 🔁 REFETCH COMPLETO
  // ============================================================

  const fetchData = async () => {
    setLoading(true);

    try {
      await updateFromApi();
      await fetchFromDB();
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 📱 MEDIA QUERY HELPER
  // ============================================================

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

  // ============================================================
  // 🔐 LOGIN
  // ============================================================

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

  // ============================================================
  // 🔐 LOGOUT
  // ============================================================

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

  // ============================================================
  // ✏️ ACTUALIZAR USUARIO
  // ============================================================

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

      localStorage.setItem("firstName", data.first_name);
      localStorage.setItem("lastName", data.last_name);
      localStorage.setItem("photo", data.photo);
      localStorage.setItem("companyName", data.company_name || "");
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);
      localStorage.setItem("id", data.id);

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

  // ============================================================
  // 🌎 CONTEXT
  // ============================================================

  return (
    <CurrencyContext.Provider
      value={{
        // Precios actuales
        currencies,
        loading,
        fetchData,
        updateOneFiatApi,

        // Historial
        snapshots,
        historyPrices,
        historyLoading,
        fetchSnapshots,
        fetchHistorySnapshot,
        fetchHistoryByDate,
        setHistoryPrices,

        // Utilidades
        useMediaQuery,

        // Auth
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
