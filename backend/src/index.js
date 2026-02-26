import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db.js";
import priceRoutes from "./routes/routesPrices.js";
import { initDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Middlewares ---------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

/* ---------- Routes ---------- */
app.use("/prices", priceRoutes);

/* ---------- Health check ---------- */
app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

/* ---------- Start server ---------- */
const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => console.log(`🚀 Servidor local en puerto ${PORT}`));
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
  }
};

startServer();

export default app;
