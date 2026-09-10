import express from "express";
import cors from "cors";

import sequelize, { initDB } from "./config/db.js";

import routes from "./routes/routes.js";
import historyRoutes from "./routes/history.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const PORT = process.env.PORT || 3000;

/* ---------- Middlewares ---------- */

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

/* ---------- Database ---------- */

const databaseReady = initDB();

app.use(async (req, res, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    console.error("❌ Base de datos no disponible:", error);

    res.status(503).json({
      error: "Base de datos no disponible",
      detail:
        process.env.NODE_ENV === "production"
          ? "No fue posible conectar con la base de datos"
          : error.message,
    });
  }
});

/* ---------- Routes ---------- */

app.use("/prices", routes);

app.use("/history", historyRoutes);

app.use("/api", authRoutes);

/* ---------- Health check ---------- */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    db: "connected",
  });
});

/* ---------- Local server ---------- */

const startServer = async () => {
  try {
    await databaseReady;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor local en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
