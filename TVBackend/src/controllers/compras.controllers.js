import sql from "mssql";
import { getConnection } from "../db/connection.js";

/* ============================
   LISTAR PROVEEDORES
================================ */
export const listarProveedores = async (req, res) => {
  try {
    let pool = await getConnection();

    let result = await pool.request().query(`
      SELECT IdProveedor, Documento, RazonSocial
      FROM PROVEEDOR
      WHERE Estado = 1
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

/* ============================
   LISTAR PRODUCTOS
================================ */
export const listarProductos = async (req, res) => {
  try {
    let pool = await getConnection();

    let result = await pool.request().query(`
      SELECT IdProducto, Codigo, Nombre, Stock, PrecioCompra, PrecioVenta
      FROM PRODUCTO
      WHERE Estado = 1
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

//CODIGO ALFANUMERICO PARA DOCUMENTO

export function generarCodigoAlfanumerico(longitud = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < longitud; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

/* ============================
  REGISTRAR COMPRA
================================ */
export const registrarCompra = async (req, res) => {
  const {
    Fecha,
    TipoDocumento,
    IdUsuario,
    IdProveedor,
    NumeroDocumento,
    Total,
    Detalle,
  } = req.body;

  try {
    const pool = await sql.connect(getConnection);
    const numeroDocGenerado = NumeroDocumento || generarCodigoAlfanumerico(10);

    if (!IdProveedor) {
      return res.status(400).json({ message: "Falta el proveedor" });
    }

    if (!Detalle || !Array.isArray(Detalle) || Detalle.length === 0) {
      return res.status(400).json({ message: "La compra no tiene productos" });
    }


    // =============================
    // INSERTAR CABECERA DE COMPRA
    // =============================
    const resultCompra = await pool.request()
      .input("IdUsuario", sql.Int, IdUsuario || 1)
      .input("IdProveedor", sql.Int, IdProveedor)
      .input("TipoDocumento", sql.VarChar(20), TipoDocumento || "COMPRA")
      .input("NumeroDocumento", sql.VarChar(20), numeroDocGenerado)
      .input("MontoTotal", sql.Decimal(18, 2), Total)
      .query(`
        INSERT INTO COMPRA
          (IdUsuario, IdProveedor, TipoDocumento, NumeroDocumento, MontoTotal, FechaRegistro)
        OUTPUT inserted.IdCompra
        VALUES
          (@IdUsuario, @IdProveedor, @TipoDocumento, @NumeroDocumento, @MontoTotal, GETDATE());
      `);

    const IdCompra = resultCompra.recordset[0].IdCompra;

    // =============================
    // INSERTAR DETALLE
    // =============================
    for (const item of Detalle) {
      await pool.request()
        .input("IdCompra", sql.Int, IdCompra)
        .input("IdProducto", sql.Int, item.IdProducto)
        .input("PrecioCompra", sql.Decimal(18, 2), item.PrecioCompra)
        .input("PrecioVenta", sql.Decimal(18, 2), item.PrecioVenta)
        .input("Cantidad", sql.Int, item.Cantidad)
        .input("Total", sql.Decimal(18, 2), item.Total)
        .query(`
          INSERT INTO DETALLE_COMPRA
            (IdCompra, IdProducto, PrecioCompra, PrecioVenta, Cantidad, Total, FechaRegistro)
          VALUES
            (@IdCompra, @IdProducto, @PrecioCompra, @PrecioVenta, @Cantidad, @Total, GETDATE());
        `);

      // =============================
      // ACTUALIZAR STOCK DEL PRODUCTO
      // =============================
      await pool.request()
        .input("IdProducto", sql.Int, item.IdProducto)
        .input("Cantidad", sql.Int, item.Cantidad)
        .input("PrecioCompra", sql.Decimal(18, 2), item.PrecioCompra)
        .input("PrecioVenta", sql.Decimal(18, 2), item.PrecioVenta)
        .query(`
          UPDATE PRODUCTO
          SET Stock = Stock + @Cantidad,
          PrecioCompra = @PrecioCompra,
          PrecioVenta = @PrecioVenta,
          Estado = 1
          WHERE IdProducto = @IdProducto;
        `);
    }

    res.json({
      message: "Compra registrada correctamente",
      IdCompra,
    });

  } catch (error) {
    console.error("❌ Error en registrarCompra:", error);
    res.status(500).json({
      message: "Error al registrar la compra",
      error: error.message,
    });
  }
};