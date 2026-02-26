import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const isProduction = !!process.env.DATABASE_URL;

export const pool = new Pool(
  isProduction
    ? {
        // 🌐 Producción (Vercel + Neon)
        connectionString: process.env.DATABASE_URL,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        max: 5, // ideal para serverless
      }
    : {
        // 💻 Desarrollo (local)
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT || 5432,
      },
);

export const initDB = async () => {
  try {
    await pool.query(`
  CREATE TABLE IF NOT EXISTS prices_by_fiat (
    id SERIAL PRIMARY KEY,
    fiat VARCHAR(10) NOT NULL UNIQUE,
    buy_price NUMERIC NOT NULL,
    sell_price NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

    console.log("✅ Tabla prices verificada/creada");
  } catch (error) {
    console.error("❌ Error creando tabla:", error);
  }
};
/*
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // 🌐 Producción (Render + Neon)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // 💻 Desarrollo (pgAdmin local)
  sequelize = new Sequelize(
    process.env.POSTGRES_DATABASE,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
      host: process.env.POSTGRES_HOST,
      dialect: process.env.DB_DIALECT,
      logging: false,
    }
  );
}

export default sequelize;
*/
