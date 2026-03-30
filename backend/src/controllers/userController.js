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
        companyName: payload.hd || "RecordApp",
        firstName: payload.given_name || firstName,
        lastName: payload.family_name || lastName,
        photo: payload.picture,
        role,
      });
    } else {
      user = await UserModel.upsert({
        email,
        companyName: payload.hd || "RecordApp",
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

    return res.json({
      token: appToken,
      role: user.role,
      firstName: payload.given_name || firstName,
      lastName: payload.family_name || lastName,
      photo: payload.picture,
      companyName: payload.hd || "RecordApp",
      email,
    });
  } catch (err) {
    console.error("❌ Error en Google Auth:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
};
