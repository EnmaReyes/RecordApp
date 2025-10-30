import axios from "axios";

// ✅ API oficial de Binance
const API_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

// ✅ Lista de monedas
const fiatList = [
  "MXN",
  "PEN",
  "COP",
  "VES",
  "CLP",
  "ARS",
  "UYU",
  "EUR",
  "USD",
  "BRL",
  "ECU",
];

// ✅ Mínimos por moneda
const minAmount = {
  MXN: 1000,
  PEN: 150,
  COP: 200000,
  VES: 5000,
  CLP: 40000,
  ARS: 50000,
  UYU: 1000,
  EUR: 100,
  USD: 100,
  ECU: 100,
  BRL: 300,
};

// 🔧 Pequeño delay entre peticiones (para no saturar)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ Función principal para traer precios
export async function fetchP2PPrices(fiat, tradeType = "SELL", minOverride) {
  try {
    const minAmountToUse = minOverride || minAmount[fiat];

    const response = await axios.post(API_URL, {
      asset: "USDT",
      fiat,
      tradeType,
      page: 1,
      rows: 20,
      countries: [],
    });

    const data = response.data.data;
    if (!data || !Array.isArray(data)) {
      console.error(`⚠️ No data para ${fiat} ${tradeType}`);
      return null;
    }

    // Filtro por monto mínimo
    const filtered = data.filter(
      (item) => Number(item.adv.minSingleTransAmount) >= minAmountToUse
    );

    // Seleccionamos posición 2 (tercero)
    const selected = filtered[2];
    if (!selected) {
      console.warn(`⚠️ No hay resultados válidos para ${fiat} ${tradeType}`);
      return null;
    }

    return {
      fiat,
      tradeType,
      price: parseFloat(selected.adv.price),
      minSingleTransAmount: parseFloat(selected.adv.minSingleTransAmount),
      maxSingleTransAmount: parseFloat(selected.adv.maxSingleTransAmount),
      paymentMethods: selected.adv.tradeMethods.map((m) => m.tradeMethodName),
    };
  } catch (err) {
    console.error(`❌ Error con ${fiat} ${tradeType}:`, err.message);
    return null;
  }
}

// ✅ Obtener todas las monedas (con delay entre cada una)
export async function fetchAllCurrencies() {
  const results = [];
  for (const fiat of fiatList) {
    const sell = await fetchP2PPrices(fiat, "SELL");
    await delay(700);
    const buy = await fetchP2PPrices(fiat, "BUY");
    await delay(700);

    if (sell) results.push(sell);
    if (buy) results.push(buy);
  }
  return results;
}

// 🔹 Ejemplo de ejecución directa
if (process.argv[1].includes("test.js")) {
  (async () => {
    const prices = await fetchAllCurrencies();
    console.table(prices);
  })();
}
