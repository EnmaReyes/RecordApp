import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255) },
    companyName: { type: DataTypes.STRING(255), field: "company_name" },
    firstName: { type: DataTypes.STRING(255), field: "first_name" },
    lastName: { type: DataTypes.STRING(255), field: "last_name" },
    photo: { type: DataTypes.TEXT },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "user",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, modelName: "User", tableName: "users", timestamps: false },
);

export const createUsersTable = async () => User.sync();

export const UserModel = {
  async create(values, options = {}) {
    return (await User.create(values, options)).get({ plain: true });
  },

  async upsert(values, options = {}) {
    const [user] = await User.upsert(values, { ...options, returning: true });
    return user.get({ plain: true });
  },

  async updateUser(id, values, options = {}) {
    const user = await User.findByPk(id, options);
    if (!user) return null;
    await user.update(values, options);
    return user.get({ plain: true });
  },

  async delete(id, options = {}) {
    const user = await User.findByPk(id, options);
    if (!user) return null;
    await user.destroy(options);
    return user.get({ plain: true });
  },

  async getAll(options = {}) {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
      ...options,
    });
    return users.map((user) => user.get({ plain: true }));
  },

  async getByEmail(email, options = {}) {
    const user = await User.findOne({ where: { email }, ...options });
    return user?.get({ plain: true });
  },
};
