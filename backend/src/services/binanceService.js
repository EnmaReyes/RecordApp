import dotenv from "dotenv";
import axios from "axios";

import { fetchAds } from "./fetchAds.js";
import { selectRobust } from "./selectPrice.js";
import { transformOrder } from "./transform.js";

dotenv.config();

/* =========================================================
   CONFIG
========================================================= */

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
  "PAN",
  "ECU",
];

const fiatAlias = {
  ECU: "USD",
  PAN: "USD",
};

const minAmount = {
  VES: 10000,
  COP: 100000,
  MXN: 1000,
  PEN: 100,
  CLP: 50000,
  ARS: 50000,
  EUR: 80,
  UYU: 1000,
  USD: 50,
  PAN: 50,
  ECU: 50,
};

const paymentFilters = {
  VES: ["Mercantil", "Banesco", "pago móvil"],

  COP: ["Nequi", "Daviplata", "Bancolombia", "Llaves Bre-B"],

  MXN: [],

  PEN: ["Yape", "Plin", "BCP"],

  CLP: [],

  ARS: [],

  EUR: ["SEPA", "Transferencia Bancaria", "BBVA", "Santander"],

  UYU: [],

  USD: ["Zelle"],

  PAN: ["Zinli", "Banco General Panama", "Banesco Panama", "Mercantil Panama"],

  ECU: [
    "Banco Pichincha",
    "Banco Guayaquil",
    "Banco del Pacífico",
    "Banco Bolivariano",
    "Produbanco",
  ],
};

/* =========================================================
   BRL EXTERNO
========================================================= */

async function fetchBRLRate() {
  try {
    const url = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL";

    const { data } = await axios.get(url);

    const usdToBrl = data.rates.BRL;

    return {
      fiat: "BRL",

      sell: {
        price: +usdToBrl.toFixed(4),

        min: null,
        max: null,

        methods: ["Banco Central do Brasil"],

        advertiser: "Frankfurter API",

        position: null,
      },

      buy: {
        price: +(usdToBrl * 1.005).toFixed(4),

        min: null,
        max: null,

        methods: ["Banco Central do Brasil"],

        advertiser: "Frankfurter API",

        position: null,
      },
    };
  } catch (error) {
    console.error("❌ Error BRL:", error.message);

    return {
      fiat: "BRL",
      sell: null,
      buy: null,
    };
  }
}

/* =========================================================
   OBTENER DATOS P2P
========================================================= */

export async function fetchP2PData(fiat) {
  const baseFiat = fiatAlias[fiat] || fiat;

  const min = minAmount[fiat] || 50;

  const payTypes = paymentFilters[fiat] || [];

  const [sellRaw, buyRaw] = await Promise.all([
    fetchAds({
      fiat: baseFiat,
      tradeType: "SELL",
      minAmount: min,
      payTypes,
    }),

    fetchAds({
      fiat: baseFiat,
      tradeType: "BUY",
      minAmount: min,
      payTypes,
    }),
  ]);

  const sellSelected = selectRobust(sellRaw, "SELL");

  const buySelected = selectRobust(buyRaw, "BUY");

  return {
    fiat,

    sell: transformOrder(sellSelected),

    buy: transformOrder(buySelected),

    source: "BINANCE_P2P",
  };
}

/* =========================================================
   CONVERTIR DATOS A RECORD DE BASE DE DATOS
========================================================= */

function buildPriceRecord(fiat, data) {
  return {
    fiat,

    /* ---------- Precios ---------- */

    buyPrice: data.buy?.price ?? null,

    sellPrice: data.sell?.price ?? null,

    /* ---------- Rangos ---------- */

    buyMin: data.buy?.min ?? null,

    buyMax: data.buy?.max ?? null,

    sellMin: data.sell?.min ?? null,

    sellMax: data.sell?.max ?? null,

    /* ---------- Métodos ---------- */

    buyMethods: data.buy?.methods ?? [],

    sellMethods: data.sell?.methods ?? [],

    /* ---------- Anunciantes ---------- */

    buyAdvertiser: data.buy?.advertiser ?? null,

    sellAdvertiser: data.sell?.advertiser ?? null,

    /* ---------- Posición ---------- */

    /*
     * transformOrder actualmente no devuelve
     * la posición, por eso queda null.
     */

    buyPosition: data.buy?.position ?? null,

    sellPosition: data.sell?.position ?? null,

    /* ---------- Fuente ---------- */

    source: fiat === "BRL" ? "FRANKFURTER_API" : "BINANCE_P2P",
  };
}

/* =========================================================
   OBTENER TODAS LAS MONEDAS
========================================================= */

export async function fetchAllCurrencies() {
  const results = [];

  for (const fiat of fiatList) {
    try {
      console.log(`🔍 ${fiat}`);

      const data =
        fiat === "BRL" ? await fetchBRLRate() : await fetchP2PData(fiat);

      if (!data || (!data.sell && !data.buy)) {
        console.warn(`⚠️ Sin datos para ${fiat}`);
        continue;
      }
      const record = buildPriceRecord(fiat, data);
      results.push(record);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error obteniendo ${fiat}:`, error.message);
    }
  }

  return results;
}
