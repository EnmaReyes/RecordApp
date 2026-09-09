import { pool } from "../config/db.js";

export const createPricesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prices_by_fiat (
        id SERIAL PRIMARY KEY,

        fiat VARCHAR(10) UNIQUE NOT NULL,

        buy_price NUMERIC(20, 8),
        sell_price NUMERIC(20, 8),

        buy_min NUMERIC(20, 8),
        buy_max NUMERIC(20, 8),

        sell_min NUMERIC(20, 8),
        sell_max NUMERIC(20, 8),

        buy_methods JSONB,
        sell_methods JSONB,

        buy_advertiser VARCHAR(255),
        sell_advertiser VARCHAR(255),

        buy_position INTEGER,
        sell_position INTEGER,

        source VARCHAR(50) DEFAULT 'BINANCE_P2P',

        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("✅ Tabla prices_by_fiat verificada/creada");
  } catch (error) {
    console.error("❌ Error creando prices_by_fiat:", error);
  }
};

// =====================================================
// CREAR TABLA DE HISTÓRICO
// =====================================================

export const createPriceHistoryTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id BIGSERIAL PRIMARY KEY,

        snapshot_id UUID NOT NULL,

        fiat VARCHAR(10) NOT NULL,

        buy_price NUMERIC(20, 8),
        sell_price NUMERIC(20, 8),

        buy_min NUMERIC(20, 8),
        buy_max NUMERIC(20, 8),

        sell_min NUMERIC(20, 8),
        sell_max NUMERIC(20, 8),

        buy_methods JSONB,
        sell_methods JSONB,

        buy_advertiser VARCHAR(255),
        sell_advertiser VARCHAR(255),

        buy_position INTEGER,
        sell_position INTEGER,

        source VARCHAR(50),

        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_price_history_fiat
        ON price_history(fiat);

      CREATE INDEX IF NOT EXISTS idx_price_history_created_at
        ON price_history(created_at);

      CREATE INDEX IF NOT EXISTS idx_price_history_snapshot
        ON price_history(snapshot_id);
    `);

    console.log("✅ Tabla price_history verificada/creada");
  } catch (error) {
    console.error("❌ Error creando price_history:", error);
  }
};

// =====================================================
// HELPERS
// =====================================================

const formatPriceRow = (row) => ({
  ...row,

  buy_price: row.buy_price !== null ? Number(row.buy_price) : null,
  sell_price: row.sell_price !== null ? Number(row.sell_price) : null,

  buy_min: row.buy_min !== null ? Number(row.buy_min) : null,
  buy_max: row.buy_max !== null ? Number(row.buy_max) : null,

  sell_min: row.sell_min !== null ? Number(row.sell_min) : null,
  sell_max: row.sell_max !== null ? Number(row.sell_max) : null,

  buy_methods: row.buy_methods || [],
  sell_methods: row.sell_methods || [],
});

// =====================================================
// MODELO PRECIOS ACTUALES
// =====================================================

export const PricesModel = {
  // ==========================================
  // OBTENER TODAS
  // ==========================================

  async getAll(db = pool) {
    const result = await db.query(`
      SELECT *
      FROM prices_by_fiat
      ORDER BY fiat ASC
    `);

    return result.rows.map(formatPriceRow);
  },

  // ==========================================
  // OBTENER UNA MONEDA
  // ==========================================

  async getByFiat(fiat, db = pool) {
    const result = await db.query(
      `
      SELECT *
      FROM prices_by_fiat
      WHERE fiat = $1
      `,
      [fiat],
    );

    if (!result.rows[0]) {
      return null;
    }

    return formatPriceRow(result.rows[0]);
  },

  // ==========================================
  // CREAR
  // ==========================================

  async create(
    {
      fiat,
      buyPrice,
      sellPrice,
      buyMin,
      buyMax,
      sellMin,
      sellMax,
      buyMethods = [],
      sellMethods = [],
      buyAdvertiser = null,
      sellAdvertiser = null,
      buyPosition = null,
      sellPosition = null,
      source = "BINANCE_P2P",
    },
    db = pool,
  ) {
    const result = await db.query(
      `
      INSERT INTO prices_by_fiat (
        fiat,
        buy_price,
        sell_price,
        buy_min,
        buy_max,
        sell_min,
        sell_max,
        buy_methods,
        sell_methods,
        buy_advertiser,
        sell_advertiser,
        buy_position,
        sell_position,
        source,
        updated_at
      )

      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        CURRENT_TIMESTAMP
      )

      RETURNING *
      `,
      [
        fiat,
        buyPrice,
        sellPrice,
        buyMin,
        buyMax,
        sellMin,
        sellMax,
        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),
        buyAdvertiser,
        sellAdvertiser,
        buyPosition,
        sellPosition,
        source,
      ],
    );

    return formatPriceRow(result.rows[0]);
  },

  // ==========================================
  // ACTUALIZAR
  // ==========================================

  async update(
    fiat,
    {
      buyPrice,
      sellPrice,
      buyMin,
      buyMax,
      sellMin,
      sellMax,
      buyMethods = [],
      sellMethods = [],
      buyAdvertiser = null,
      sellAdvertiser = null,
      buyPosition = null,
      sellPosition = null,
      source = "BINANCE_P2P",
    },
    db = pool,
  ) {
    const result = await db.query(
      `
      UPDATE prices_by_fiat

      SET
        buy_price = $1,
        sell_price = $2,

        buy_min = $3,
        buy_max = $4,

        sell_min = $5,
        sell_max = $6,

        buy_methods = $7,
        sell_methods = $8,

        buy_advertiser = $9,
        sell_advertiser = $10,

        buy_position = $11,
        sell_position = $12,

        source = $13,

        updated_at = CURRENT_TIMESTAMP

      WHERE fiat = $14

      RETURNING *
      `,
      [
        buyPrice,
        sellPrice,
        buyMin,
        buyMax,
        sellMin,
        sellMax,
        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),
        buyAdvertiser,
        sellAdvertiser,
        buyPosition,
        sellPosition,
        source,
        fiat,
      ],
    );

    return result.rows[0] ? formatPriceRow(result.rows[0]) : null;
  },

  // ==========================================
  // UPSERT
  // ==========================================

  async upsert(
    {
      fiat,
      buyPrice,
      sellPrice,
      buyMin,
      buyMax,
      sellMin,
      sellMax,
      buyMethods = [],
      sellMethods = [],
      buyAdvertiser = null,
      sellAdvertiser = null,
      buyPosition = null,
      sellPosition = null,
      source = "BINANCE_P2P",
    },
    db = pool,
  ) {
    const result = await db.query(
      `
      INSERT INTO prices_by_fiat (
        fiat,
        buy_price,
        sell_price,
        buy_min,
        buy_max,
        sell_min,
        sell_max,
        buy_methods,
        sell_methods,
        buy_advertiser,
        sell_advertiser,
        buy_position,
        sell_position,
        source,
        updated_at
      )

      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        CURRENT_TIMESTAMP
      )

      ON CONFLICT (fiat)

      DO UPDATE SET

        buy_price = EXCLUDED.buy_price,
        sell_price = EXCLUDED.sell_price,

        buy_min = EXCLUDED.buy_min,
        buy_max = EXCLUDED.buy_max,

        sell_min = EXCLUDED.sell_min,
        sell_max = EXCLUDED.sell_max,

        buy_methods = EXCLUDED.buy_methods,
        sell_methods = EXCLUDED.sell_methods,

        buy_advertiser = EXCLUDED.buy_advertiser,
        sell_advertiser = EXCLUDED.sell_advertiser,

        buy_position = EXCLUDED.buy_position,
        sell_position = EXCLUDED.sell_position,

        source = EXCLUDED.source,

        updated_at = CURRENT_TIMESTAMP

      RETURNING *
      `,
      [
        fiat,
        buyPrice,
        sellPrice,
        buyMin,
        buyMax,
        sellMin,
        sellMax,
        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),
        buyAdvertiser,
        sellAdvertiser,
        buyPosition,
        sellPosition,
        source,
      ],
    );

    return formatPriceRow(result.rows[0]);
  },

  // ==========================================
  // ELIMINAR
  // ==========================================

  async delete(fiat, db = pool) {
    await db.query(
      `
      DELETE FROM prices_by_fiat
      WHERE fiat = $1
      `,
      [fiat],
    );
  },
};

// =====================================================
// MODELO HISTÓRICO
// =====================================================

export const PriceHistoryModel = {
  async create(
    {
      snapshotId,
      fiat,
      buyPrice,
      sellPrice,
      buyMin,
      buyMax,
      sellMin,
      sellMax,
      buyMethods = [],
      sellMethods = [],
      buyAdvertiser = null,
      sellAdvertiser = null,
      buyPosition = null,
      sellPosition = null,
      source = "BINANCE_P2P",
    },
    db = pool,
  ) {
    const result = await db.query(
      `
      INSERT INTO price_history (
        snapshot_id,
        fiat,

        buy_price,
        sell_price,

        buy_min,
        buy_max,

        sell_min,
        sell_max,

        buy_methods,
        sell_methods,

        buy_advertiser,
        sell_advertiser,

        buy_position,
        sell_position,

        source,

        created_at
      )

      VALUES (
        $1, $2,
        $3, $4,
        $5, $6,
        $7, $8,
        $9, $10,
        $11, $12,
        $13, $14,
        $15,
        CURRENT_TIMESTAMP
      )

      RETURNING *
      `,
      [
        snapshotId,
        fiat,

        buyPrice,
        sellPrice,

        buyMin,
        buyMax,

        sellMin,
        sellMax,

        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),

        buyAdvertiser,
        sellAdvertiser,

        buyPosition,
        sellPosition,

        source,
      ],
    );

    return formatPriceRow(result.rows[0]);
  },

  // ==========================================
  // HISTÓRICO POR MONEDA
  // ==========================================

  async getByFiat(fiat, db = pool) {
    const result = await db.query(
      `
      SELECT *
      FROM price_history
      WHERE fiat = $1
      ORDER BY created_at DESC
      `,
      [fiat],
    );

    return result.rows.map(formatPriceRow);
  },

  // ==========================================
  // HISTÓRICO POR FECHA
  // ==========================================

  async getByDate(date, db = pool) {
    const result = await db.query(
      `
      SELECT *
      FROM price_history
      WHERE created_at::date = $1
      ORDER BY created_at DESC
      `,
      [date],
    );

    return result.rows.map(formatPriceRow);
  },

  // ==========================================
  // HISTÓRICO POR SNAPSHOT
  // ==========================================

  async getBySnapshot(snapshotId, db = pool) {
    const result = await db.query(
      `
      SELECT *
      FROM price_history
      WHERE snapshot_id = $1
      ORDER BY fiat ASC
      `,
      [snapshotId],
    );

    return result.rows.map(formatPriceRow);
  },

  // ==========================================
  // OBTENER ÚLTIMO SNAPSHOT
  // ==========================================

  async getLatestSnapshot(db = pool) {
    const result = await db.query(`
      SELECT *
      FROM price_history
      WHERE snapshot_id = (
        SELECT snapshot_id
        FROM price_history
        ORDER BY created_at DESC
        LIMIT 1
      )
      ORDER BY fiat ASC
    `);

    return result.rows.map(formatPriceRow);
  },
};
