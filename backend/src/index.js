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

app.use(express.json());
app.use("/prices", priceRoutes);

// Probar conexión
sequelize
  .authenticate()
  .then(() => console.log("🟢 DB conectada"))
  .catch((err) => console.error("❌ Error DB:", err.message));

/*
  ⭐ LOCAL MODE
  Si NO estás en Vercel → levantar servidor normalmente
*/
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local corriendo en http://localhost:${PORT}`);
  });
}

/*
  ⭐ SERVERLESS MODE (Vercel)
  Exportamos SIEMPRE la app para que Vercel la envuelva.
*/
export default app;
