import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import priceRoutes from "./routes/routesPrices.js";

dotenv.config();
const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use("/prices", priceRoutes);

// Sincronizar DB una sola vez
sequelize
  .sync({ alter: true })
  .then(() => console.log("🟢 DB sincronizada"))
  .catch((err) => console.error("❌ Error al sincronizar DB:", err));

export default app;
