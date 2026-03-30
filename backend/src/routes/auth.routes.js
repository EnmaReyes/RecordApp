import express from "express";
import {
  googleAuthController,
  updateUserController,
} from "../controllers/userController.js";

const router = express.Router();

// Ruta de autenticación con Google
router.post("/auth/google", (req, res) => {
  googleAuthController(req, res);
});

// Ruta para actualizar datos de usuario
router.patch("/users/:id/company", updateUserController);

export default router;
