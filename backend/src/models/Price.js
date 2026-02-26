import { pool } from "../config/db.js";

export const PricesModel = {
  async getAll() {
    const result = await pool.query(
      "SELECT * FROM prices_by_fiat ORDER BY fiat ASC",
    );
    return result.rows.map((row) => ({
      ...row,
      buy_price: Number(row.buy_price),
      sell_price: Number(row.sell_price),
    }));
  },

  async getByFiat(fiat) {
    const result = await pool.query(
      "SELECT * FROM prices_by_fiat WHERE fiat = $1",
      [fiat],
    );
    return result.rows[0];
  },

  async create({ fiat, buyPrice, sellPrice }) {
    const result = await pool.query(
      `
      INSERT INTO prices_by_fiat (fiat, buy_price, sell_price)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [fiat, buyPrice, sellPrice],
    );
    return result.rows[0];
  },

  async update(fiat, { buyPrice, sellPrice }) {
    const result = await pool.query(
      `
      UPDATE prices_by_fiat
      SET buy_price = $1,
          sell_price = $2
      WHERE fiat = $3
      RETURNING *
      `,
      [buyPrice, sellPrice, fiat],
    );
    return result.rows[0];
  },

  async delete(fiat) {
    await pool.query("DELETE FROM prices_by_fiat WHERE fiat = $1", [fiat]);
  },

  async upsert({ fiat, buyPrice, sellPrice }) {
    await pool.query(
      `
      INSERT INTO prices_by_fiat (fiat, buy_price, sell_price)
      VALUES ($1, $2, $3)
      ON CONFLICT (fiat)
      DO UPDATE SET
        buy_price = EXCLUDED.buy_price,
        sell_price = EXCLUDED.sell_price
      `,
      [fiat, buyPrice, sellPrice],
    );
  },
};

/*import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PricesByFiat = sequelize.define("PricesByFiat", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fiat: { type: DataTypes.STRING, allowNull: false, unique: true },
  buyPrice: { type: DataTypes.FLOAT, allowNull: false },
  sellPrice: { type: DataTypes.FLOAT, allowNull: false },
  minSingleTransAmount: { type: DataTypes.FLOAT },
  maxSingleTransAmount: { type: DataTypes.FLOAT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default PricesByFiat;
*/
