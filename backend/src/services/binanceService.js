import dotenv from "dotenv";
import { fetchAds } from "./fetchAds.js";
import { selectRobust } from "./selectPrice.js";
import { transformOrder } from "./transform.js";
import axios from "axios";

dotenv.config();

/* ---------- Config ---------- */
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
const fiatAlias = { ECU: "USD", PAN: "USD" };

const minAmount = {
  VES: 10000,
  COP: 200000,
  MXN: 1000,
  PEN: 200,
  CLP: 20000,
  ARS: 50000,
  EUR: 100,
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

/* ---------- BRL externo ---------- */
async function fetchBRLRate() {
  try {
    const url = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL";
    const { data } = await axios.get(url);
    const usdToBrl = data.rates.BRL;

    return {
      fiat: "BRL",
      sell: {
        price: +usdToBrl.toFixed(4),
        methods: ["Banco Central do Brasil"],
        advertiser: "Frankfurter API",
      },
      buy: {
        price: +(usdToBrl * 1.005).toFixed(4),
        methods: ["Banco Central do Brasil"],
        advertiser: "Frankfurter API",
      },
    };
  } catch (err) {
    console.error("❌ Error BRL:", err.message);
    return { fiat: "BRL", sell: null, buy: null };
  }
}

/* ---------- Core ---------- */
export async function fetchP2PData(fiat) {
  const baseFiat = fiatAlias[fiat] || fiat; // si es ECU o PAN → USD
  const min = minAmount[fiat] || 50; // usa el min propio
  const payTypes = paymentFilters[fiat] || [];

  const [sellRaw, buyRaw] = await Promise.all([
    fetchAds({ fiat: baseFiat, tradeType: "SELL", minAmount: min, payTypes }),
    fetchAds({ fiat: baseFiat, tradeType: "BUY", minAmount: min, payTypes }),
  ]);

  const sellSelected = selectRobust(sellRaw);
  const buySelected = selectRobust(buyRaw);

  return {
    fiat,
    sell: transformOrder(sellSelected),
    buy: transformOrder(buySelected),
  };
}

/* ---------- Global ---------- */
export async function fetchAllCurrencies() {
  const results = [];

  for (const fiat of fiatList) {
    console.log(`🔍 ${fiat}`);

    const data =
      fiat === "BRL" ? await fetchBRLRate() : await fetchP2PData(fiat);

    if (!data.sell && !data.buy) continue;

    results.push({
      fiat,
      buyPrice: data.buy?.price || null,
      sellPrice: data.sell?.price || null,
      buyMethods: data.buy?.methods || [],
      sellMethods: data.sell?.methods || [],
    });

    await new Promise((r) => setTimeout(r, 500)); // anti-rate limit
  }

  return results;
}
