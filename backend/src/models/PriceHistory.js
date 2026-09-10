import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../config/db.js";

export class PriceHistory extends Model {}

PriceHistory.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    snapshotId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "snapshot_id",
    },

    prices: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    modelName: "PriceHistory",
    tableName: "price_history",
    timestamps: false,

    indexes: [
      {
        fields: ["created_at"],
      },
      {
        fields: ["snapshot_id"],
      },
    ],
  },
);

export const createPriceHistoryTable = async () => {
  await PriceHistory.sync();
};

const toPlain = (row) => {
  if (!row) return null;

  const value = row.get({ plain: true });

  return {
    ...value,
    id: Number(value.id),
    prices: value.prices || {},
  };
};

export const PriceHistoryModel = {
  async create({ snapshotId, prices }, options = {}) {
    return toPlain(
      await PriceHistory.create(
        {
          snapshotId,
          prices,
        },
        options,
      ),
    );
  },

  async getByFiat(fiat, options = {}) {
    const normalizedFiat = fiat?.trim().toUpperCase();

    const rows = await PriceHistory.findAll({
      where: {
        prices: {
          [Op.contains]: {
            [normalizedFiat]: {},
          },
        },
      },
      order: [["createdAt", "DESC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getByDate(date, options = {}) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const rows = await PriceHistory.findAll({
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      order: [["createdAt", "DESC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getBySnapshot(snapshotId, options = {}) {
    return toPlain(
      await PriceHistory.findOne({
        where: {
          snapshotId,
        },
        ...options,
      }),
    );
  },

  async getAll(options = {}) {
    const rows = await PriceHistory.findAll({
      order: [["createdAt", "DESC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getLatestSnapshot(options = {}) {
    return toPlain(
      await PriceHistory.findOne({
        order: [["createdAt", "DESC"]],
        ...options,
      }),
    );
  },
};
