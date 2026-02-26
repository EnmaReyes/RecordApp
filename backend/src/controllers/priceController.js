import { PricesModel } from "../models/Price.js";
import {
  fetchP2PData,
  fetchAllCurrencies,
} from "../services/binanceService.js";

/* ---------- Helper para armar record ---------- */
function buildRecord(fiat, data) {
  return {
    fiat,
    sellPrice: data.sell?.price || null,
    buyPrice: data.buy?.price || null,
  };
}

/* ---------- Helper para obtener data según alias ---------- */
async function getDataByAlias(fiat) {
  const aliases = {
    ecuador: ["Banco Pichincha", "Banco Guayaquil", "Produbanco"],
    zinli: ["Zinli"],
  };

  if (aliases[fiat]) {
    return await fetchP2PData("USD", null, aliases[fiat]);
  }
  return await fetchP2PData(fiat);
}

/* ---------- Obtener y guardar precio por fiat ---------- */
export async function getPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    const data = await getDataByAlias(fiat);

    if (!data || (!data.sell && !data.buy)) {
      return res
        .status(404)
        .json({ message: `No se encontraron datos para ${fiat}.` });
    }

    const record = buildRecord(fiat, data);
    await PricesModel.upsert(record);

    res.json({
      message: `✅ ${fiat} actualizado correctamente.`,
      data: record,
    });
  } catch (error) {
    console.error(`❌ Error al actualizar ${fiat}:`, error);
    res.status(500).json({ error: error.message });
  }
}

/* ---------- Actualizar todas las monedas ---------- */
export async function getAllPrices(req, res) {
  try {
    const prices = await fetchAllCurrencies();

    const [zinliData, ecuadorData] = await Promise.all([
      getDataByAlias("zinli"),
      getDataByAlias("ecuador"),
    ]);

    const extraRecords = [
      buildRecord("zinli", zinliData),
      buildRecord("ecuador", ecuadorData),
    ];

    const allRecords = [...prices, ...extraRecords];

    for (const item of allRecords) {
      await PricesModel.upsert(item);
    }

    res.json({
      message: "Precios actualizados correctamente",
      data: allRecords,
    });
  } catch (error) {
    console.error("❌ Error al actualizar precios:", error);
    res.status(500).json({ error: error.message });
  }
}

/* ---------- Obtener precios desde DB ---------- */
export async function getDBPrices(req, res) {
  try {
    const prices = await PricesModel.getAll();
    res.json({ data: prices });
  } catch (error) {
    console.error("❌ Error al obtener precios desde DB:", error);
    res.status(500).json({ error: error.message });
  }
}

/* ---------- Obtener precio por fiat desde DB ---------- */
export async function getDBPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    const price = await PricesModel.getByFiat(fiat);

    if (!price) {
      return res.status(404).json({ error: `No se encontró ${fiat}` });
    }

    res.json(price);
  } catch (error) {
    console.error(`❌ Error al obtener ${fiat}:`, error);
    res.status(500).json({ error: error.message });
  }
}
