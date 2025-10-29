import Price from "../models/Price.js";
import {
  fetchP2PPrices,
  fetchAllCurrencies,
} from "../services/binanceService.js";

export async function getPriceByFiat(req, res) {
  const { fiat } = req.params;
  try {
    const sell = await fetchP2PPrices(fiat, "SELL");
    const buy = await fetchP2PPrices(fiat, "BUY");

    const all = [sell, buy].filter(Boolean);

    for (const item of all) {
      await Price.create(item);
    }

    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllPrices(req, res) {
  try {
    const prices = await fetchAllCurrencies();
    for (const item of prices) {
      await Price.create(item);
    }
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
