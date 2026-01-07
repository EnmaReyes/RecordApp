import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db.js";
import priceRoutes from "./routes/routesPrices.js";

dotenv.config();

const app = express();

/* ---------- Middlewares ---------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
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

const PORT = process.env.PORT || 3000;

/* ---------- Local dev only ---------- */
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Servidor local en puerto ${PORT}`));
}

export default app;

/*import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import priceRoutes from "./routes/routesPrices.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/prices", priceRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log("🟢 DB sincronizada");
  app.listen(PORT, () =>
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  );
});
*/
