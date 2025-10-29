import express from "express";
import {
  getAllPrices,
  getPriceByFiat,
} from "../controllers/priceController.js";

const router = express.Router();

router.get("/:fiat", getPriceByFiat); // Ej: /prices/MXN
router.get("/", getAllPrices); // Todas las monedas

export default router;
