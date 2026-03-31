import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserModel } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const allowedAdmins = [
  "record.cambios@gmail.com",
  "Inversionesfranirs@gmail.com",
  "gionayrangel@gmail.com",
];

export const googleAuthController = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const fullName = payload.name || "";
    const [firstName, ...rest] = fullName.split(" ");
    
    const lastName = rest.join(" ");

    let user = await UserModel.getByEmail(email);

    if (!user) {
      const role = allowedAdmins.includes(email) ? "admin" : "user";

      user = await UserModel.create({
        email,
        companyName: role === "admin" ? payload.hd || "RecordApp" : null,
        firstName: payload.given_name || firstName,
        lastName: payload.family_name || lastName,
        photo: payload.picture,
        role,
      });
    } else {
      user = await UserModel.upsert({
        email,
        companyName:
          user.role === "admin" ? payload.hd || "RecordApp" : user.company_name,
        firstName: payload.given_name || firstName,
        lastName: payload.family_name || lastName,
        photo: payload.picture || user.photo,
        role: allowedAdmins.includes(email) ? "admin" : user.role,
      });
    }

    const appToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const returnData = res.json({
      token: appToken,
      role: user.role,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      photo: user.photo,
      companyName: user.companyName || user.company_name,
      email: user.email,
      id: user.id,
    });

    return returnData;
  } catch (err) {
    console.error("❌ Error en Google Auth:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Editar datos de usuario
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, photo, companyName } = req.body;

    // Solo admin o user pueden modificar
    if (req.user.role !== "admin" && req.user.role !== "user") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const dataToUpdate =
      req.user.role === "user"
        ? { firstName, lastName, photo }
        : { firstName, lastName, photo, companyName };

    const updatedUser = await UserModel.updateUser(id, dataToUpdate);

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(updatedUser);
  } catch (err) {
    console.error("❌ Error al actualizar datos del usuario:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};
