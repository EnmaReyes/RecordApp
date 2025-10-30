import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Price = sequelize.define("Price", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fiat: { type: DataTypes.STRING },
  tradeType: { type: DataTypes.STRING }, // BUY o SELL
  price: { type: DataTypes.FLOAT },
  minSingleTransAmount: { type: DataTypes.FLOAT },
  maxSingleTransAmount: { type: DataTypes.FLOAT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Price;
