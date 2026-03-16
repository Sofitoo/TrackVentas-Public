import {getConnection, sql} from '../db/connection.js'

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM PRODUCTO");
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos");
  }
};

// Crear producto
export const createProducto = async (req, res) => {
  try {
    const { IdCategoria, Codigo, Nombre, Descripcion, Estado = 1 } = req.body;

    //validacion
      if (!Codigo || !Nombre) {
      return res.status(400).json({ message: "Código y Nombre son obligatorios" });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("IdCategoria", sql.Int, IdCategoria)
      .input("Codigo", sql.VarChar, Codigo)
      .input("Nombre", sql.VarChar, Nombre)
      .input("Descripcion", sql.VarChar, Descripcion || null)
      .input("Estado", sql.Bit, Estado)
      .input('Stock', sql.Int, 0)
      .input('PrecioCompra', sql.Decimal(10,2), 0)
      .input('PrecioVenta', sql.Decimal(10,2), 0)
      .query(`
        INSERT INTO PRODUCTO
        (Codigo, Nombre, Descripcion, IdCategoria, Estado, Stock, PrecioCompra, PrecioVenta, FechaRegistro)
        OUTPUT INSERTED.*
        VALUES (@Codigo, @Nombre, @Descripcion, @IdCategoria, @Estado, @Stock, @PrecioCompra, @PrecioVenta, GETDATE())
      `);

       res.json({ producto: result.recordset[0] });

    /*const newProduct = {
      IdProducto: result.recordset[0].IdProducto,
      IdCategoria,
      Codigo,
      Nombre,
      Descripcion,
      Estado,
    };

    res.json(newProduct);*/
  } catch (error) {
    console.error("Error al crear producto:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// Actualizar producto
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdCategoria, Codigo, Nombre, Descripcion, Estado } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("IdProducto", sql.Int, id)
      .input("IdCategoria", sql.Int, IdCategoria)
      .input("Codigo", sql.VarChar, Codigo)
      .input("Nombre", sql.VarChar, Nombre)
      .input("Descripcion", sql.VarChar, Descripcion || null)
      .input("Estado", sql.Bit, Estado)
      /*.input('Stock', sql.Int, null)
      .input('PrecioCompra', sql.Decimal(10,2), null)
      .input('PrecioVenta', sql.Decimal(10,2), null)*/
      .query(`
        UPDATE PRODUCTO SET
        Codigo = @Codigo,
        Nombre = @Nombre,
        Descripcion = @Descripcion,
        IdCategoria = @IdCategoria,
        Estado = @Estado
        WHERE IdProducto = @IdProducto
      `);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).send("Error al actualizar producto");
  }
};

// Eliminar producto
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    await pool
      .request()
      .input("IdProducto", sql.Int, id)
      .query("DELETE FROM PRODUCTO WHERE IdProducto = @IdProducto");

    res.sendStatus(200);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).send("Error al eliminar producto");
  }
};



