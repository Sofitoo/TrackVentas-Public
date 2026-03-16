import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export const obtenerProveedores = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT IdProveedor AS IdProveedor,
             Documento AS Documento,
             RazonSocial AS RazonSocial
      FROM PROVEEDOR
      ORDER BY RazonSocial
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

// proveedores con todos los datos:
export const obtenerProveedoresFull = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        IdProveedor,
        Documento,
        RazonSocial,
        Correo,
        Telefono,
        Estado,
        FechaRegistro
      FROM PROVEEDOR
      ORDER BY RazonSocial
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener proveedores (full):", error);
    res.status(500).json({ message: "Error al obtener proveedores completos" });
  }
};


// =========================
//  CREAR PROVEEDOR
// =========================
export const crearProveedor = async (req, res) => {
  try {
    const { Documento, RazonSocial, Correo, Telefono, Estado } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("Documento", sql.VarChar, Documento)
      .input("RazonSocial", sql.VarChar, RazonSocial)
      .input("Correo", sql.VarChar, Correo)
      .input("Telefono", sql.VarChar, Telefono)
      .input("Estado", sql.Bit, Estado ? 1 : 0)
      .query(`
        INSERT INTO PROVEEDOR (Documento, RazonSocial, Correo, Telefono, Estado, FechaRegistro)
        VALUES (@Documento, @RazonSocial, @Correo, @Telefono, @Estado, GETDATE())
      `);

    res.json({ message: "Proveedor creado correctamente" });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    res.status(500).json({ message: "Error al crear proveedor" });
  }
};

// =========================
//  ACTUALIZAR PROVEEDOR
// =========================
export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { Documento, RazonSocial, Correo, Telefono, Estado } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("IdProveedor", sql.Int, id)
      .input("Documento", sql.VarChar, Documento)
      .input("RazonSocial", sql.VarChar, RazonSocial)
      .input("Correo", sql.VarChar, Correo)
      .input("Telefono", sql.VarChar, Telefono)
      .input("Estado", sql.Bit, Estado ? 1 : 0)
      .query(`
        UPDATE PROVEEDOR
        SET Documento = @Documento,
            RazonSocial = @RazonSocial,
            Correo = @Correo,
            Telefono = @Telefono,
            Estado = @Estado
        WHERE IdProveedor = @IdProveedor
      `);

    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
};

// =========================
//  ELIMINAR PROVEEDOR
// =========================
export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool
      .request()
      .input("IdProveedor", sql.Int, id)
      .query(`
        DELETE FROM PROVEEDOR
        WHERE IdProveedor = @IdProveedor
      `);

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);

    if (error.number === 547) {
      // Error por FK
      return res.status(400).json({
        message: "No se puede eliminar el proveedor porque tiene registros relacionados",
      });
    }

    res.status(500).json({ message: "Error al eliminar proveedor" });
  }
};