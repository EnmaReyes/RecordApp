import dotenv from "dotenv";
import pg from "pg";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelizeOptions = {
  dialect: "postgres",

  // Le indicamos explícitamente a Sequelize qué driver usar
  dialectModule: pg,

  logging: false,

  pool: {
    max: 3,
    min: 0,
    idle: 10000,
    acquire: 30000,
  },
};

let sequelize;

if (process.env.DATABASE_URL) {
  // Neon / PostgreSQL remoto
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...sequelizeOptions,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },

      connectionTimeoutMillis: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
  });
} else {
  // PostgreSQL local
  sequelize = new Sequelize(
    process.env.POSTGRES_DATABASE,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
      ...sequelizeOptions,

      host: process.env.POSTGRES_HOST || "localhost",
      port: process.env.POSTGRES_PORT || 5432,
    },
  );
}

let dbReadyPromise = null;

export const initDB = () => {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      try {
        await sequelize.authenticate();

        await sequelize.sync();

        const { createPriceHistoryTable } =
          await import("../models/PriceHistory.js");

        await createPriceHistoryTable();

        console.log(
          "✅ Base de datos conectada y tablas verificadas correctamente",
        );
      } catch (error) {
        dbReadyPromise = null;

        console.error("❌ Error inicializando la base de datos:", error);

        throw error;
      }
    })();
  }

  return dbReadyPromise;
};

export default sequelize;
export { sequelize };
