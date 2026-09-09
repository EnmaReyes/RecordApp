import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import { PriceHistoryModel, PricesModel } from "../models/Price.js";
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

async function saveHistory(record, snapshotId, db) {
  return await PriceHistoryModel.create(
    {
      snapshotId,

      fiat: record.fiat,

      buyPrice: record.buyPrice,
      sellPrice: record.sellPrice,

      buyMin: record.buyMin,
      buyMax: record.buyMax,

      sellMin: record.sellMin,
      sellMax: record.sellMax,

      buyMethods: record.buyMethods,
      sellMethods: record.sellMethods,

      buyAdvertiser: record.buyAdvertiser,
      sellAdvertiser: record.sellAdvertiser,

      buyPosition: record.buyPosition,
      sellPosition: record.sellPosition,

      source: record.source,
    },
    db,
  );
}

/* =========================================================
   Obtener y guardar precio por fiat
========================================================= */

export async function getPriceByFiat(req, res) {
  const { fiat } = req.params;

  let client;

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

    // 4️⃣ Obtener conexión exclusiva
    client = await pool.connect();

    // 5️⃣ Iniciar transacción
    await client.query("BEGIN");

    // 6️⃣ Actualizar precio actual
    const updatedPrice = await PricesModel.upsert(record, client);

    // 7️⃣ Guardar histórico
    const historyPrice = await saveHistory(record, snapshotId, client);

    // 8️⃣ Confirmar
    await client.query("COMMIT");

    res.json({
      message: `✅ ${fiat} actualizado correctamente.`,

      data: updatedPrice,

      history: {
        snapshotId,
        createdAt: historyPrice.created_at,
      },
    });
  } catch (error) {
    // Si hubo error, deshacer TODO
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("❌ Error haciendo ROLLBACK:", rollbackError.message);
      }
    }

    console.error(`❌ Error al actualizar ${fiat}:`, error);

    res.status(500).json({
      error: error.message,
    });
  } finally {
    // Liberar conexión
    if (client) {
      client.release();
    }
  }
}

/* =========================================================
   Actualizar TODAS las monedas
========================================================= */

export async function getAllPrices(req, res) {
  let client;

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

    // 3️⃣ Obtener conexión
    client = await pool.connect();

    // 4️⃣ Iniciar transacción
    await client.query("BEGIN");

    const updatedPrices = [];
    const historyPrices = [];

    // 5️⃣ Guardar cada moneda
    for (const item of prices) {
      const record = item;

      const updatedPrice = await PricesModel.upsert(record, client);

      updatedPrices.push(updatedPrice);

      const historyPrice = await saveHistory(record, snapshotId, client);

      historyPrices.push(historyPrice);
    }

    // 6️⃣ Confirmar TODA la operación
    await client.query("COMMIT");

    res.json({
      message: "Precios actualizados correctamente",

      snapshotId,

      data: updatedPrices,

      history: {
        count: historyPrices.length,

        createdAt: historyPrices[0]?.created_at ?? null,
      },
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("❌ Error haciendo ROLLBACK:", rollbackError.message);
      }
    }

    console.error("❌ Error al actualizar precios:", error);

    res.status(500).json({
      error: error.message,
    });
  } finally {
    // Liberar conexión
    if (client) {
      client.release();
    }
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
   Obtener snapshot completo
========================================================= */

export async function getHistoryBySnapshot(req, res) {
  const { snapshotId } = req.params;

  try {
    const history = await PriceHistoryModel.getBySnapshot(snapshotId);

    if (!history.length) {
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
