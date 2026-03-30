import express from "express";
import { googleAuthController } from "../controllers/userController.js";

const router = express.Router();

// Ruta de autenticación con Google
router.post("/auth/google", (req, res) => {
  console.log("Google auth route hit"); // debug
  googleAuthController(req, res);
});

export default router;
