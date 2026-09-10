import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelizeOptions = {
  dialect: "postgres",
  logging: false,
  pool: { max: 5, min: 0, idle: 10000 },
};

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      ...sequelizeOptions,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(
      process.env.POSTGRES_DATABASE,
      process.env.POSTGRES_USER,
      process.env.POSTGRES_PASSWORD,
      {
        ...sequelizeOptions,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT || 5432,
      },
    );

export const initDB = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  const { createPriceHistoryTable } = await import("../models/PriceHistory.js");
  await createPriceHistoryTable();
  console.log("✅ Tablas Prices, PriceHistory y Users verificadas/creadas");
};

export default sequelize;
