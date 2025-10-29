import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import priceRoutes from "./routes/prices.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/prices", priceRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log("🟢 DB sincronizada");
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
});

