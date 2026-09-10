import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

export class Price extends Model {}

Price.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fiat: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("fiat", value?.trim().toUpperCase());
      },
    },

    buyPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: "buy_price",
    },

    sellPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: "sell_price",
    },

    buyMin: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: "buy_min",
    },

    buyMax: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: "buy_max",
    },

    sellMin: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: "sell_min",
    },

    sellMax: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: "sell_max",
    },

    buyMethods: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: "buy_methods",
    },

    sellMethods: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: "sell_methods",
    },

    buyAdvertiser: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "buy_advertiser",
    },

    sellAdvertiser: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "sell_advertiser",
    },

    buyPosition: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "buy_position",
    },

    sellPosition: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "sell_position",
    },

    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "BINANCE_P2P",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    modelName: "Price",
    tableName: "prices_by_fiat",
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ["fiat"],
      },
      {
        fields: ["updated_at"],
      },
    ],
  },
);

export const createPricesTable = async () => {
  await Price.sync();
};

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  return Number(value);
};

const toPlain = (row) => {
  if (!row) return null;

  const value = row.get({ plain: true });

  return {
    ...value,

    buyPrice: toNumber(value.buyPrice),
    sellPrice: toNumber(value.sellPrice),
    buyMin: toNumber(value.buyMin),
    buyMax: toNumber(value.buyMax),
    sellMin: toNumber(value.sellMin),
    sellMax: toNumber(value.sellMax),

    buyMethods: value.buyMethods || [],
    sellMethods: value.sellMethods || [],
  };
};

export const PricesModel = {
  async getAll(options = {}) {
    const rows = await Price.findAll({
      order: [["fiat", "ASC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getByFiat(fiat, options = {}) {
    return toPlain(
      await Price.findOne({
        where: {
          fiat: fiat?.trim().toUpperCase(),
        },
        ...options,
      }),
    );
  },

  async create(values, options = {}) {
    return toPlain(
      await Price.create(
        {
          ...values,
          fiat: values.fiat?.trim().toUpperCase(),
        },
        options,
      ),
    );
  },

  async update(fiat, values, options = {}) {
    const row = await Price.findOne({
      where: {
        fiat: fiat?.trim().toUpperCase(),
      },
      ...options,
    });

    if (!row) return null;

    await row.update(values, options);

    return toPlain(row);
  },

  async upsert(values, options = {}) {
    const [row] = await Price.upsert(
      {
        ...values,
        fiat: values.fiat?.trim().toUpperCase(),
      },
      {
        ...options,
        returning: true,
      },
    );

    return toPlain(row);
  },

  async delete(fiat, options = {}) {
    await Price.destroy({
      where: {
        fiat: fiat?.trim().toUpperCase(),
      },
      ...options,
    });
  },
};
