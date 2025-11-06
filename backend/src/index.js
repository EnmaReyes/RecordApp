import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // 👈 importa CORS
import sequelize from "./config/db.js";
import priceRoutes from "./routes/routesPrices.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
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
