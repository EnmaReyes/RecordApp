import express from "express";
import {
  getAllPrices,
  getPriceByFiat,
  getDBPrices,
  getDBPriceByFiat,
} from "../controllers/priceController.js";

const router = express.Router();

// Actualiza precios
router.get("/update", getAllPrices);
router.get("/update/:fiat", getPriceByFiat);

// Obtiene precios desde la base de datos
router.get("/", getDBPrices);
router.get("/:fiat", getDBPriceByFiat);

export default router;
