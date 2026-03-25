import { pool } from "../config/db.js";

export const createPricesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prices_by_fiat (
        id SERIAL PRIMARY KEY,
        fiat VARCHAR(10) UNIQUE NOT NULL,
        buy_price NUMERIC,
        sell_price NUMERIC,
        buy_methods JSONB,
        sell_methods JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabla prices_by_fiat verificada/creada");
  } catch (error) {
    console.error("❌ Error creando tabla prices_by_fiat:", error);
  }
};

export const PricesModel = {
  async getAll() {
    const result = await pool.query(
      "SELECT * FROM prices_by_fiat ORDER BY fiat ASC",
    );
    return result.rows.map((row) => ({
      ...row,
      buy_price: Number(row.buy_price),
      sell_price: Number(row.sell_price),
      buy_methods: row.buy_methods || [],
      sell_methods: row.sell_methods || [],
      updated_at: row.updated_at,
    }));
  },

  async getByFiat(fiat) {
    const result = await pool.query(
      "SELECT * FROM prices_by_fiat WHERE fiat = $1",
      [fiat],
    );
    return result.rows[0];
  },

  async create({
    fiat,
    buyPrice,
    sellPrice,
    buyMethods = [],
    sellMethods = [],
  }) {
    const result = await pool.query(
      `
      INSERT INTO prices_by_fiat (fiat, buy_price, sell_price, buy_methods, sell_methods, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        fiat,
        buyPrice,
        sellPrice,
        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),
      ],
    );
    return result.rows[0];
  },

  async update(
    fiat,
    { buyPrice, sellPrice, buyMethods = [], sellMethods = [] },
  ) {
    const result = await pool.query(
      `
      UPDATE prices_by_fiat
      SET buy_price = $1,
          sell_price = $2,
          buy_methods = $3,
          sell_methods = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE fiat = $5
      RETURNING *
      `,
      [
        buyPrice,
        sellPrice,
        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),
        fiat,
      ],
    );
    return result.rows[0];
  },

  async delete(fiat) {
    await pool.query("DELETE FROM prices_by_fiat WHERE fiat = $1", [fiat]);
  },

  async upsert({
    fiat,
    buyPrice,
    sellPrice,
    buyMethods = [],
    sellMethods = [],
  }) {
    await pool.query(
      `
    INSERT INTO prices_by_fiat (fiat, buy_price, sell_price, buy_methods, sell_methods, updated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (fiat)
    DO UPDATE SET
      buy_price = EXCLUDED.buy_price,
      sell_price = EXCLUDED.sell_price,
      buy_methods = EXCLUDED.buy_methods,
      sell_methods = EXCLUDED.sell_methods,
      updated_at = CURRENT_TIMESTAMP
    `,
      [
        fiat,
        buyPrice,
        sellPrice,
        JSON.stringify(buyMethods),
        JSON.stringify(sellMethods),
      ],
    );
  },
};
