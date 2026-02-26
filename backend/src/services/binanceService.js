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
];

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
};

const paymentFilters = {
  VES: ["Mercantil", "Banesco", "pago móvil"],
  COP: ["Nequi", "Daviplata", "Bancolombia"],
  MXN: [],
  PEN: ["Yape", "Plin", "BCP"],
  CLP: [],
  ARS: [],
  EUR: ["SEPA", "Transferencia Bancaria", "BBVA", "Santander"],
  UYU: [],
  USD: ["Zelle"],
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
  const min = minAmount[fiat] || 50;
  const payTypes = paymentFilters[fiat] || [];

  const [sellRaw, buyRaw] = await Promise.all([
    fetchAds({ fiat, tradeType: "SELL", minAmount: min, payTypes }),
    fetchAds({ fiat, tradeType: "BUY", minAmount: min, payTypes }),
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
    });

    await new Promise((r) => setTimeout(r, 500)); // anti-rate limit
  }

  return results;
}
