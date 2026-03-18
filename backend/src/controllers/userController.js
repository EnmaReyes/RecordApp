import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../config/db.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Lista blanca de admins
const allowedAdmins = ["record.cambios@gmail.com", "Inversionesfranirs@gmail.com"];

export const googleAuthController = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
 
    const payload = ticket.getPayload();
    const email = payload.email;

    // Buscar usuario
    let result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    let user = result.rows[0];

    // Crear si no existe
    if (!user) {
      const role = allowedAdmins.includes(email) ? "admin" : "user";
      const insert = await pool.query(
        `INSERT INTO users (email, company_name, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          email,
          payload.hd || "RecordApp",
          payload.given_name,
          payload.family_name,
          role,
        ],
      );
      user = insert.rows[0];
    }

    // Generar JWT con rol
    const appToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({ token: appToken, role: user.role });
  } catch (err) {
    console.error("❌ Error en Google Auth:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
};
