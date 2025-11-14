import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize;

if (process.env.NODE_ENV === "production") {
  // 🔵 PRODUCCIÓN — RENDER + SUPABASE
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // 🔥 IMPORTANTE
      },
    },
    logging: false,
  });
} else {
  // 🟡 DESARROLLO LOCAL — PGADMIN
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
