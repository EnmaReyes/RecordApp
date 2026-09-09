import axios from "axios";

const API_URL = process.env.API_URL;

export async function fetchAds({
  fiat,
  tradeType,
  minAmount,
  payTypes,
}) {
  const params = {
    asset: "USDT",
    fiat,
    tradeType,
    page: 1,
    rows: 20,
    countries: [],
    payTypes,
    publisherType: "merchant",
    transAmount: minAmount.toString(),
  };

  try {
    let { data } = await axios.post(API_URL, params);

    let results = data?.data;

    // 🔁 Fallback sin filtros
    if (!results?.length) {
      const fallbackParams = {
        ...params,
        publisherType: null,
        payTypes: [],
      };

      ({ data } = await axios.post(API_URL, fallbackParams));

      results = data?.data;
    }

    if (!Array.isArray(results)) {
      return [];
    }

    return results.filter((item) => {
      const min = Number(item.adv?.minSingleTransAmount);
      const max = Number(item.adv?.maxSingleTransAmount);

      return (
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min <= minAmount &&
        max >= minAmount
      );
    });
  } catch (error) {
    console.error(
      `❌ Error fetching ${fiat} ${tradeType}:`,
      error.message,
    );

    return [];
  }
}