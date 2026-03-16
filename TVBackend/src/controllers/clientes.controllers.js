import { getConnection } from "../db/connection.js";
import sql from 'mssql';

// LISTA DE CLIENTES

export const obtenerClientes = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        IdCliente,
        Documento,
        NombreCompleto,
        Correo,
        Telefono,
        Estado,
        FechaRegistro
      FROM CLIENTE
      ORDER BY NombreCompleto
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

//  CREAR CLIENTE

export const crearCliente = async (req, res) => {
  try {
    const { Documento, NombreCompleto, Correo, Telefono, Estado } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("Documento", sql.VarChar, Documento)
      .input("NombreCompleto", sql.VarChar, NombreCompleto)
      .input("Correo", sql.VarChar, Correo)
      .input("Telefono", sql.VarChar, Telefono)
      .input("Estado", sql.Bit, Estado ? 1 : 0)
      .query(`
        INSERT INTO CLIENTE (Documento, NombreCompleto, Correo, Telefono, Estado, FechaRegistro)
        VALUES (@Documento, @NombreCompleto, @Correo, @Telefono, @Estado, GETDATE())
      `);

    res.json({ message: "Cliente creado correctamente" });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

//ACTUALIZAR CLIENTE

export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { Documento, NombreCompleto, Correo, Telefono, Estado } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("IdCliente", sql.Int, id)
      .input("Documento", sql.VarChar, Documento)
      .input("NombreCompleto", sql.VarChar, NombreCompleto)
      .input("Correo", sql.VarChar, Correo)
      .input("Telefono", sql.VarChar, Telefono)
      .input("Estado", sql.Bit, Estado ? 1 : 0)
      .query(`
        UPDATE CLIENTE
        SET Documento = @Documento,
            NombreCompleto = @NombreCompleto,
            Correo = @Correo,
            Telefono = @Telefono,
            Estado = @Estado
        WHERE IdCliente = @IdCliente
      `);

    res.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};
//ELIMINAR CLIENTE
 export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool
    .request()
    .input("IdCliente", sql.Int, id)
    .query(`
      DELETE FROM CLIENTE
      WHERE IdCliente = @IdCliente
      `);

    res.json({ message: "Cliente eliminado correctamente"});
  } catch (error) {
    console.error("Error al eliminar al cliente:", error);

    if (error.number === 547) {
      return res.status(400).json({
        message: "No se puede eliminar el cliente porque tiene registros relacionados",
      });
    }
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
 };