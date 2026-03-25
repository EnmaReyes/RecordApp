import { pool } from "../config/db.js";

export const createUsersTable = async () => {
  try {
    await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  company_name VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

`);
    console.log("✅ Tabla users verificada/creada");
  } catch (error) {
    console.error("❌ Error creando tabla users:", error);
  }
};

export const UserModel = {
  // Crear un usuario nuevo
  async create({
    email,
    password,
    companyName,
    firstName,
    lastName,
    role = "user",
  }) {
    const result = await pool.query(
      `
      INSERT INTO users (email, password, company_name, first_name, last_name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [email, password, companyName, firstName, lastName, role],
    );
    return result.rows[0];
  },

  // Upsert: si existe el email, actualiza; si no, crea
  async upsert({
    email,
    password,
    companyName,
    firstName,
    lastName,
    role = "user",
  }) {
    const result = await pool.query(
      `
      INSERT INTO users (email, password, company_name, first_name, last_name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (email)
      DO UPDATE SET
        password = EXCLUDED.password,
        company_name = EXCLUDED.company_name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role
      RETURNING *
      `,
      [email, password, companyName, firstName, lastName, role],
    );
    return result.rows[0];
  },

  // Actualizar un usuario por id
  async update(
    id,
    { email, password, companyName, firstName, lastName, role },
  ) {
    const result = await pool.query(
      `
      UPDATE users
      SET email = COALESCE($2, email),
          password = COALESCE($3, password),
          company_name = COALESCE($4, company_name),
          first_name = COALESCE($5, first_name),
          last_name = COALESCE($6, last_name),
          role = COALESCE($7, role)
      WHERE id = $1
      RETURNING *
      `,
      [id, email, password, companyName, firstName, lastName, role],
    );
    return result.rows[0];
  },

  // Eliminar un usuario por id
  async delete(id) {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  },

  // Obtener todos los usuarios (extra)
  async getAll() {
    const result = await pool.query(
      `SELECT * FROM users ORDER BY created_at DESC`,
    );
    return result.rows;
  },

  // Obtener un usuario por email (extra)
  async getByEmail(email) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows[0];
  },
};
