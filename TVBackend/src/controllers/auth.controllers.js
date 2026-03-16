import { signToken } from "../utils/jwt.js";
import sql from "mssql";
import { getConnection } from "../db/connection.js";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  try {
    const { Documento, Clave } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input("Documento", sql.VarChar, Documento)
      .query("SELECT TOP 1 IdUsuario, NombreCompleto, Correo, Clave, IdRol FROM USUARIO WHERE Documento = @Documento");

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    // verificar password (si usás hash)
    const match = await bcrypt.compare(Clave, user.Clave);
    if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

    // payload con IdRol
    const payload = {
      IdUsuario: user.IdUsuario,
      NombreCompleto: user.NombreCompleto,
      Correo: user.Correo,
      IdRol: user.IdRol
    };

    const token = signToken(payload);

    return res.json({
      usuario: payload,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
