import { DataTypes } from "sequelize";
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
