import axios from "axios";

const API_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

// ✅ Lista de monedas
const fiatList = [
  "VES",
  "COP",
  "MXN",
  "PEN",
  "CLP",
  "ARS",
  "EUR",
  "UYU",
  "USD",
];

// ✅ Monto mínimo personalizado por fiat
const minAmount = {
  VES: 5000,
  COP: 200000,
  MXN: 1000,
  PEN: 200,
  CLP: 20000,
  ARS: 50000,
  EUR: 100,
  UYU: 1000,
  USD: 100,
};

// ✅ Métodos de pago personalizados por fiat
const paymentFilters = {
  USD: ["Zelle", "Banco Pichincha", "Produbanco", "Banco Guayaquil"],
  EUR: ["SEPA", "Transferencia Bancaria", "BBVA", "Santander"],
  PEN: ["Yape", "Plin", "BCP"],
  COP: ["Nequi", "Daviplata", "Bancolombia"],
  CLP: [],
  VES: ["Mercantil", "Banesco", "pago móvil"],
  UYU: [],
  ARS: [],
  MXN: [],
};

// 🔧 Delay entre peticiones
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function selectBest(filtered) {
  if (!filtered || filtered.length === 0) return null;

  // Filtramos las órdenes que tengan datos completos
  const validOrders = filtered.filter(
    (f) =>
      f.adv?.price &&
      f.adv.tradeMethods?.length > 0 &&
      f.advertiser?.nickName &&
      f.adv.minSingleTransAmount > 0
  );

  const topOrders = validOrders.slice(0, 10);

  if (topOrders.length === 0) return null;

  return topOrders[0];
}

// ✅ Nueva función: obtiene BUY y SELL juntos
export async function fetchP2PData(fiat, minOverride) {
  const minAmountToUse = minOverride || minAmount[fiat];
  const payTypes = paymentFilters[fiat] || [];

  const makeRequest = async (tradeType) => {
    const params = {
      asset: "USDT",
      fiat,
      tradeType,
      page: 1,
      rows: 20,
      countries: [],
      payTypes,
      publisherType: "merchant",
      transAmount: minAmountToUse.toString(),
    };

    let response = await axios.post(API_URL, params);
    let data = response.data.data;

    // 🔁 Si no encontró nada, probamos sin publisherType ni filtros
    if (!data || data.length === 0) {
      console.warn(`⚠️ Reintentando ${fiat} sin filtros...`);
      const fallbackParams = { ...params, publisherType: null, payTypes: [] };
      response = await axios.post(API_URL, fallbackParams);
      data = response.data.data;
    }

    if (!data || !Array.isArray(data)) return [];

    return data.filter(
      (item) => Number(item.adv.minSingleTransAmount) >= minAmountToUse
    );
  };

  try {
    // Ejecutamos BUY y SELL en paralelo para ganar velocidad
    const [sellData, buyData] = await Promise.all([
      makeRequest("SELL"),
      makeRequest("BUY"),
    ]);

    const sellSelected = selectBest(sellData);
    const buySelected = selectBest(buyData);

    return {
      fiat,
      sell: sellSelected
        ? {
            price: parseFloat(sellSelected.adv.price),
            min: parseFloat(sellSelected.adv.minSingleTransAmount),
            max: parseFloat(sellSelected.adv.maxSingleTransAmount),
            methods: sellSelected.adv.tradeMethods.map(
              (m) => m.tradeMethodName
            ),
            advertiser: sellSelected.advertiser.nickName,
          }
        : null,
      buy: buySelected
        ? {
            price: parseFloat(buySelected.adv.price),
            min: parseFloat(buySelected.adv.minSingleTransAmount),
            max: parseFloat(buySelected.adv.maxSingleTransAmount),
            methods: buySelected.adv.tradeMethods.map((m) => m.tradeMethodName),
            advertiser: buySelected.advertiser.nickName,
          }
        : null,
    };
  } catch (err) {
    console.error(`❌ Error con ${fiat}:`, err.message);
    return { fiat, sell: null, buy: null };
  }
}

// ✅ Función principal optimizada
export async function fetchAllCurrencies() {
  const results = [];

  for (const fiat of fiatList) {
    console.log(`\n🔍 Consultando ${fiat}...`);

    const data = await fetchP2PData(fiat);
    await delay(700); // delay ligero para no saturar el endpoint

    if (!data.sell && !data.buy) {
      console.warn(`⚠️ Sin resultados para ${fiat}`);
      continue;
    }

    results.push({
      fiat,
      buyPrice: data.buy ? data.buy.price : null,
      sellPrice: data.sell ? data.sell.price : null,
      buyMin: data.buy ? data.buy.min : null,
      sellMin: data.sell ? data.sell.min : null,
      buyMax: data.buy ? data.buy.max : null,
      sellMax: data.sell ? data.sell.max : null,
      buyMethods: data.buy ? data.buy.methods : [],
      sellMethods: data.sell ? data.sell.methods : [],
    });
  }

  return results;
}

// 🔹 Ejecución directa de prueba
if (process.argv[1].includes("test.js")) {
  (async () => {
    const prices = await fetchAllCurrencies();
    console.table(prices);
  })();
}
