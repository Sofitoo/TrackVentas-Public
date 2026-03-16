import {getConnection, sql} from '../db/connection.js'

// Traer todas las categorías
export const getCategorias = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM CATEGORIA");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener las categorias:", error);
    res.status(500).send("Error al obtener categorías");
  }
};

// Crear nueva categoría
export const createCategoria = async (req, res) => {
  try {
    const { Descripcion, Estado } = req.body;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("Descripcion", sql.NVarChar, Descripcion)
      .input("Estado", sql.Bit, Estado)
      .query(
        "INSERT INTO CATEGORIA (Descripcion, Estado, FechaRegistro) OUTPUT INSERTED.* VALUES (@Descripcion, @Estado, GETDATE())"
      );

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear categoría");
  }
};

// Editar categoría existente
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { Descripcion, Estado } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("IdCategoria", sql.Int, id)
      .input("Descripcion", sql.NVarChar, Descripcion)
      .input("Estado", sql.Bit, Estado)
      .query(
        "UPDATE CATEGORIA SET Descripcion=@Descripcion, Estado=@Estado WHERE IdCategoria=@IdCategoria"
      );

    res.json({ message: "Categoría actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar categoría");
  }
};

// Eliminar categoría
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    await pool
      .request()
      .input("IdCategoria", sql.Int, id)
      .query("DELETE FROM CATEGORIA WHERE IdCategoria=@IdCategoria");

    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar categoría");
  }
};