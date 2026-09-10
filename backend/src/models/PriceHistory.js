import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../config/db.js";

export class PriceHistory extends Model {}

PriceHistory.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    snapshotId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "snapshot_id",
    },
    prices: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "PriceHistory",
    tableName: "price_history",
    timestamps: false,
    indexes: [{ fields: ["created_at"] }, { fields: ["snapshot_id"] }],
  },
);

export const createPriceHistoryTable = async () => {
  await PriceHistory.sync();

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'price_history'
          AND column_name = 'fiat'
      ) THEN
        ALTER TABLE price_history ALTER COLUMN fiat DROP NOT NULL;
      END IF;
    END $$;
  `);
};

const toPlain = (row) => {
  if (!row) return null;

  const value = row.get({ plain: true });

  return {
    id: Number(value.id),
    snapshotId: value.snapshotId,
    snapshot_id: value.snapshotId,
    prices: value.prices || {},
    createdAt: value.createdAt,
    created_at: value.createdAt,
  };
};

const currentSnapshotsWhere = {
  prices: { [Op.ne]: {} },
};

export const PriceHistoryModel = {
  async create({ snapshotId, prices }, options = {}) {
    return toPlain(await PriceHistory.create({ snapshotId, prices }, options));
  },

  async getByFiat(fiat, options = {}) {
    const rows = await PriceHistory.findAll({
      where: {
        [Op.and]: [
          currentSnapshotsWhere,
          { prices: { [Op.contains]: { [fiat]: {} } } },
        ],
      },
      order: [["createdAt", "DESC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getByDate(date, options = {}) {
    const rows = await PriceHistory.findAll({
      where: {
        [Op.and]: [
          currentSnapshotsWhere,
          sequelize.where(
            sequelize.fn("DATE", sequelize.col("created_at")),
            date,
          ),
        ],
      },
      order: [["createdAt", "DESC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getBySnapshot(snapshotId, options = {}) {
    return toPlain(
      await PriceHistory.findOne({
        where: { [Op.and]: [currentSnapshotsWhere, { snapshotId }] },
        ...options,
      }),
    );
  },

  async getAll(options = {}) {
    const rows = await PriceHistory.findAll({
      where: currentSnapshotsWhere,
      order: [["createdAt", "DESC"]],
      ...options,
    });

    return rows.map(toPlain);
  },

  async getLatestSnapshot(options = {}) {
    return toPlain(
      await PriceHistory.findOne({
        where: currentSnapshotsWhere,
        order: [["createdAt", "DESC"]],
        ...options,
      }),
    );
  },
};
