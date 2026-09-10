import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

export class Price extends Model {}

Price.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fiat: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    buyPrice: { type: DataTypes.DECIMAL(20, 8), field: "buy_price" },
    sellPrice: { type: DataTypes.DECIMAL(20, 8), field: "sell_price" },
    buyMin: { type: DataTypes.DECIMAL(20, 8), field: "buy_min" },
    buyMax: { type: DataTypes.DECIMAL(20, 8), field: "buy_max" },
    sellMin: { type: DataTypes.DECIMAL(20, 8), field: "sell_min" },
    sellMax: { type: DataTypes.DECIMAL(20, 8), field: "sell_max" },
    buyMethods: {
      type: DataTypes.JSONB,
      field: "buy_methods",
      defaultValue: [],
    },
    sellMethods: {
      type: DataTypes.JSONB,
      field: "sell_methods",
      defaultValue: [],
    },
    buyAdvertiser: { type: DataTypes.STRING(255), field: "buy_advertiser" },
    sellAdvertiser: { type: DataTypes.STRING(255), field: "sell_advertiser" },
    buyPosition: { type: DataTypes.INTEGER, field: "buy_position" },
    sellPosition: { type: DataTypes.INTEGER, field: "sell_position" },
    source: { type: DataTypes.STRING(50), defaultValue: "BINANCE_P2P" },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Price",
    tableName: "prices_by_fiat",
    timestamps: false,
  },
);

export const createPricesTable = async () => Price.sync();

const toPlain = (row) => {
  if (!row) return null;
  const value = row.get({ plain: true });
  return {
    ...value,
    buy_price: value.buyPrice === null ? null : Number(value.buyPrice),
    sell_price: value.sellPrice === null ? null : Number(value.sellPrice),
    buy_min: value.buyMin === null ? null : Number(value.buyMin),
    buy_max: value.buyMax === null ? null : Number(value.buyMax),
    sell_min: value.sellMin === null ? null : Number(value.sellMin),
    sell_max: value.sellMax === null ? null : Number(value.sellMax),
    buy_methods: value.buyMethods || [],
    sell_methods: value.sellMethods || [],
    buy_advertiser: value.buyAdvertiser,
    sell_advertiser: value.sellAdvertiser,
    buy_position: value.buyPosition,
    sell_position: value.sellPosition,
    updated_at: value.updatedAt,
    buyPrice: value.buyPrice === null ? null : Number(value.buyPrice),
    sellPrice: value.sellPrice === null ? null : Number(value.sellPrice),
    buyMin: value.buyMin === null ? null : Number(value.buyMin),
    buyMax: value.buyMax === null ? null : Number(value.buyMax),
    sellMin: value.sellMin === null ? null : Number(value.sellMin),
    sellMax: value.sellMax === null ? null : Number(value.sellMax),
    buyMethods: value.buyMethods || [],
    sellMethods: value.sellMethods || [],
  };
};

export const PricesModel = {
  async getAll(options = {}) {
    const rows = await Price.findAll({ order: [["fiat", "ASC"]], ...options });
    return rows.map(toPlain);
  },

  async getByFiat(fiat, options = {}) {
    return toPlain(await Price.findOne({ where: { fiat }, ...options }));
  },

  async create(values, options = {}) {
    return toPlain(await Price.create(values, options));
  },

  async update(fiat, values, options = {}) {
    const row = await Price.findOne({ where: { fiat }, ...options });
    if (!row) return null;
    await row.update(values, options);
    return toPlain(row);
  },

  async upsert(values, options = {}) {
    const [row] = await Price.upsert(values, { ...options, returning: true });
    return toPlain(row);
  },

  async delete(fiat, options = {}) {
    await Price.destroy({ where: { fiat }, ...options });
  },
};
