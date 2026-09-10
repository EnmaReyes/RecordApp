import { randomUUID } from "crypto";
import sequelize from "../config/db.js";
import { PriceHistoryModel } from "../models/PriceHistory.js";
import { PricesModel } from "../models/Price.js";
import {
  fetchP2PData,
  fetchAllCurrencies,
} from "../services/binanceService.js";

function buildRecord(fiat, data) {
  return {
    fiat,

    // Precios
    buyPrice: data.buy?.price ?? null,
    sellPrice: data.sell?.price ?? null,

    // Rangos
    buyMin: data.buy?.min ?? null,
    buyMax: data.buy?.max ?? null,

    sellMin: data.sell?.min ?? null,
    sellMax: data.sell?.max ?? null,
    // Métodos de pago
    buyMethods: data.buy?.methods ?? [],
    sellMethods: data.sell?.methods ?? [],
    // Anunciantes
    buyAdvertiser: data.buy?.advertiser ?? null,
    sellAdvertiser: data.sell?.advertiser ?? null,
    // Posición
    buyPosition: data.buy?.position ?? null,
    sellPosition: data.sell?.position ?? null,
    // Fuente
    source: data.source ?? "BINANCE_P2P",
  };
}

/* =========================================================
   Helper para guardar histórico
========================================================= */

async function saveHistory(prices, snapshotId, transaction) {
  return await PriceHistoryModel.create(
    {
      snapshotId,
      prices,
    },
    { transaction },
  );
}

/* =========================================================
   Obtener y guardar precio por fiat
========================================================= */

export async function getPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    // 1️⃣ Obtener datos desde Binance
    const data = await fetchP2PData(fiat);

    if (!data || (!data.sell && !data.buy)) {
      return res.status(404).json({
        message: `No se encontraron datos para ${fiat}.`,
      });
    }

    // 2️⃣ Construir registro
    const record = buildRecord(fiat, data);

    // 3️⃣ Crear snapshot
    const snapshotId = randomUUID();

    const { updatedPrice, historyPrice } = await sequelize.transaction(
      async (transaction) => ({
        updatedPrice: await PricesModel.upsert(record, { transaction }),
        historyPrice: await saveHistory(
          { [record.fiat]: record },
          snapshotId,
          transaction,
        ),
      }),
    );

    res.json({
      message: `✅ ${fiat} actualizado correctamente.`,

      data: updatedPrice,

      history: {
        snapshotId,
        createdAt: historyPrice.createdAt,
      },
    });
  } catch (error) {
    console.error(`❌ Error al actualizar ${fiat}:`, error);

    res.status(500).json({
      error: error.message,
    });
  }
}

/* =========================================================
   Actualizar TODAS las monedas
========================================================= */

export async function getAllPrices(req, res) {
  try {
    // 1️⃣ Obtener todas las tasas
    const prices = await fetchAllCurrencies();

    if (!prices.length) {
      return res.status(404).json({
        error: "No se encontraron precios para actualizar.",
      });
    }

    // 2️⃣ Un snapshot representa TODA esta actualización
    const snapshotId = randomUUID();

    const { updatedPrices, historyPrice } = await sequelize.transaction(
      async (transaction) => {
        const updatedPrices = [];
        const pricesByFiat = {};

        for (const record of prices) {
          updatedPrices.push(await PricesModel.upsert(record, { transaction }));
          pricesByFiat[record.fiat] = record;
        }

        const historyPrice = await saveHistory(
          pricesByFiat,
          snapshotId,
          transaction,
        );

        return { updatedPrices, historyPrice };
      },
    );

    res.json({
      message: "Precios actualizados correctamente",

      snapshotId,

      data: updatedPrices,

      history: {
        count: Object.keys(historyPrice.prices).length,
        createdAt: historyPrice.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar precios:", error);

    res.status(500).json({
      error: error.message,
    });
  }
}

/* =========================================================
   Obtener precios actuales desde DB
========================================================= */

export async function getDBPrices(req, res) {
  try {
    const prices = await PricesModel.getAll();

    res.json({
      data: prices,
    });
  } catch (error) {
    console.error("❌ Error al obtener precios desde DB:", error);

    res.status(500).json({
      error: error.message,
    });
  }
}

/* =========================================================
   Obtener precio actual por fiat desde DB
========================================================= */

export async function getDBPriceByFiat(req, res) {
  const { fiat } = req.params;

  try {
    const price = await PricesModel.getByFiat(fiat);

    if (!price) {
      return res.status(404).json({
        error: `No se encontró ${fiat}`,
      });
    }

    res.json(price);
  } catch (error) {
    console.error(`❌ Error al obtener ${fiat}:`, error);

    res.status(500).json({
      error: error.message,
    });
  }
}

/* =========================================================
   Obtener histórico por fiat
========================================================= */

export async function getHistoryByFiat(req, res) {
  const { fiat } = req.params;

  try {
    const history = await PriceHistoryModel.getByFiat(fiat);

    res.json({
      fiat,
      data: history,
    });
  } catch (error) {
    console.error(`❌ Error al obtener histórico de ${fiat}:`, error);

    res.status(500).json({
      error: error.message,
    });
  }
}

/* =========================================================
   Obtener histórico por fecha
========================================================= */

export async function getHistoryByDate(req, res) {
  const { date } = req.params;

  try {
    const history = await PriceHistoryModel.getByDate(date);

    res.json({
      date,
      data: history,
    });
  } catch (error) {
    console.error(`❌ Error al obtener histórico del ${date}:`, error);

    res.status(500).json({
      error: error.message,
    });
  }
}

/* =========================================================
   Obtener todas las actualizaciones históricas
========================================================= */

export async function getHistory(req, res) {
  try {
    const history = await PriceHistoryModel.getAll();
    res.json({ data: history });
  } catch (error) {
    console.error("❌ Error al obtener el histórico:", error);
    res.status(500).json({ error: error.message });
  }
}

/* =========================================================
   Obtener snapshot completo
========================================================= */

export async function getHistoryBySnapshot(req, res) {
  const { snapshotId } = req.params;

  try {
    const history = await PriceHistoryModel.getBySnapshot(snapshotId);

    if (!history) {
      return res.status(404).json({
        error: "No se encontró el snapshot solicitado.",
      });
    }

    res.json({
      snapshotId,
      data: history,
    });
  } catch (error) {
    console.error("❌ Error al obtener snapshot:", error);

    res.status(500).json({
      error: error.message,
    });
  }
}
