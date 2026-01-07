import { pool } from "../config/db.js";

export const PricesModel = {
  async getAll() {
    const result = await pool.query(
      "SELECT * FROM prices_by_fiat ORDER BY fiat ASC"
    );
    return result.rows;
  },

  async getByFiat(fiat) {
    const result = await pool.query(
      "SELECT * FROM prices_by_fiat WHERE fiat = $1",
      [fiat]
    );
    return result.rows[0];
  },

  async create(data) {
    const {
      fiat,
      buyPrice,
      sellPrice,
      minSingleTransAmount,
      maxSingleTransAmount,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO prices_by_fiat
      (fiat, buy_price, sell_price, min_single_trans_amount, max_single_trans_amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [fiat, buyPrice, sellPrice, minSingleTransAmount, maxSingleTransAmount]
    );

    return result.rows[0];
  },

  async update(fiat, data) {
    const { buyPrice, sellPrice, minSingleTransAmount, maxSingleTransAmount } =
      data;

    const result = await pool.query(
      `
      UPDATE prices_by_fiat
      SET
        buy_price = $1,
        sell_price = $2,
        min_single_trans_amount = $3,
        max_single_trans_amount = $4
      WHERE fiat = $5
      RETURNING *
      `,
      [buyPrice, sellPrice, minSingleTransAmount, maxSingleTransAmount, fiat]
    );

    return result.rows[0];
  },

  async delete(fiat) {
    await pool.query("DELETE FROM prices_by_fiat WHERE fiat = $1", [fiat]);
  },
  async upsert(data) {
    const {
      fiat,
      buyPrice,
      sellPrice,
      sellMin,
      buyMin,
      sellMax,
      buyMax,
      sellPaymentMethods,
      buyPaymentMethods,
    } = data;

    await pool.query(
      `
    INSERT INTO prices_by_fiat
    (fiat, buy_price, sell_price, sell_min, buy_min, sell_max, buy_max, sell_payment_methods, buy_payment_methods)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (fiat)
    DO UPDATE SET
      buy_price = EXCLUDED.buy_price,
      sell_price = EXCLUDED.sell_price,
      sell_min = EXCLUDED.sell_min,
      buy_min = EXCLUDED.buy_min,
      sell_max = EXCLUDED.sell_max,
      buy_max = EXCLUDED.buy_max,
      sell_payment_methods = EXCLUDED.sell_payment_methods,
      buy_payment_methods = EXCLUDED.buy_payment_methods
    `,
      [
        fiat,
        buyPrice,
        sellPrice,
        sellMin,
        buyMin,
        sellMax,
        buyMax,
        JSON.stringify(sellPaymentMethods),
        JSON.stringify(buyPaymentMethods),
      ]
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
