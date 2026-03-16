import { signToken } from "../utils/jwt.js";
import sql from "mssql";
import { getConnection } from "../db/connection.js";
import bcrypt from "bcryptjs";


/*export const loginUsuario = async (req, res) => {
  const { Documento, Clave } = req.body;

  console.log("BODY RECIBIDO:", req.body);


  if (!Documento || !Clave) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('documento', Documento)
      .query('SELECT * FROM USUARIO WHERE Documento = @documento');

    const user = result.recordset[0];

    console.log("Documento recibido:", Documento);
console.log("Clave recibida:", Clave);
console.log("User encontrado:", user);


    if (!user || user.Clave !== Clave) {
      return res.status(401).json({ message: 'Documento o clave incorrectos' });
    }

    // 🔴 Bloqueo si está inactivo
    if (user.estado === 0) {
    return res.status(403).json({ message: "Usuario inactivo" }); 
    }

    // Token simulado, en producción usar JWT
    res.json({ message: 'Login OK', token: 'mi-token-simulado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};*/

export const loginUsuario = async (req, res) => {
  try {
    const { Documento, Clave } = req.body;

    console.log("BODY RECIBIDO:", req.body);

    if (!Documento || !Clave) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("Documento", sql.VarChar, Documento)
      .query("SELECT IdUsuario, NombreCompleto, Correo, Clave, IdRol, Estado FROM USUARIO WHERE Documento = @Documento");

    const user = result.recordset[0];

    console.log("User encontrado:", user);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Comparación simple porque usás columna 'Clave'
    if (user.Clave !== Clave) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (user.Estado === 0) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    // Crear token real con JWT
    const payload = {
      IdUsuario: user.IdUsuario,
      IdRol: user.IdRol,
      NombreCompleto: user.NombreCompleto,
      Correo: user.Correo,
    };

    const token = signToken(payload);

    return res.json({
      success: true,
      token,
      rol: user.IdRol,
      nombre: user.NombreCompleto
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
