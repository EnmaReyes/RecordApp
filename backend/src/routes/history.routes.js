import express from "express";
import {
  getHistory,
  getHistoryByDate,
  getHistoryByFiat,
  getHistoryBySnapshot,
} from "../controllers/priceController.js";

const router = express.Router();

router.get("/", getHistory);
router.get("/snapshot/:snapshotId", getHistoryBySnapshot);
router.get("/date/:date", getHistoryByDate);
router.get("/fiat/:fiat", getHistoryByFiat);

export default router;
