import PricesByFiat from "../models/Price.js";
import {
  fetchP2PPrices,
  fetchAllCurrencies,
} from "../services/binanceService.js";

export async function getPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    const sell = await fetchP2PPrices(fiat, "SELL");
    const buy = await fetchP2PPrices(fiat, "BUY");

    const data = {
      fiat,
      sellPrice: sell?.price || null,
      buyPrice: buy?.price || null,
      sellMin: sell?.minSingleTransAmount || null,
      buyMin: buy?.minSingleTransAmount || null,
      sellMax: sell?.maxSingleTransAmount || null,
      buyMax: buy?.maxSingleTransAmount || null,
      sellPaymentMethods: sell?.paymentMethods || [],
      buyPaymentMethods: buy?.paymentMethods || [],
    };

    // ✅ Actualiza o crea si no existe
    await PricesByFiat.upsert(data);

    res.json({
      message: `Precio de ${fiat} actualizado correctamente.`,
      data,
    });
  } catch (error) {
    console.error(`❌ Error al actualizar ${fiat}:`, error);
    res.status(500).json({ error: error.message });
  }
}

export async function getAllPrices(req, res) {
  try {
    const prices = await fetchAllCurrencies();

    for (const item of prices) {
      // upsert = crea o actualiza si ya existe el fiat
      await PricesByFiat.upsert(item, { where: { fiat: item.fiat } });
    }

    res.json({ message: "Precios actualizados correctamente", data: prices });
  } catch (error) {
    console.error("❌ Error al actualizar precios:", error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener precios desde la base de datos
export async function getDBPrices(req, res) {
  try {
    const prices = await PricesByFiat.findAll();
    res.json({ data: prices });
  } catch (error) {
    console.error("❌ Error al obtener precios desde DB:", error);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/prices/:fiat
export async function getDBPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    const price = await PricesByFiat.findOne({ where: { fiat } });

    if (!price) {
      return res.status(404).json({ error: `No se encontró ${fiat}` });
    }

    res.json(price);
  } catch (error) {
    console.error(`❌ Error al obtener ${fiat}:`, error);
    res.status(500).json({ error: error.message });
  }
}
