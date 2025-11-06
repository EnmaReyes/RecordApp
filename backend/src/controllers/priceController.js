import PricesByFiat from "../models/Price.js";
import {
  fetchP2PData,
  fetchAllCurrencies,
} from "../services/binanceService.js";

export async function getPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    // 🔹 Obtenemos datos organizados desde fetchP2PData()
    const data = await fetchP2PData(fiat);

    if (!data || (!data.sell && !data.buy)) {
      return res.status(404).json({
        message: `No se encontraron datos para ${fiat}.`,
      });
    }

    // 🔹 Armamos el objeto para la DB
    const record = {
      fiat,
      sellPrice: data.sell?.price || null,
      buyPrice: data.buy?.price || null,
      sellMin: data.sell?.min || null,
      buyMin: data.buy?.min || null,
      sellMax: data.sell?.max || null,
      buyMax: data.buy?.max || null,
      sellPaymentMethods: data.sell?.methods || [],
      buyPaymentMethods: data.buy?.methods || [],
    };

    // 🔹 Upsert (crea o actualiza)
    await PricesByFiat.upsert(record);

    res.json({
      message: `✅ ${fiat} actualizado correctamente.`,
      data: record,
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
