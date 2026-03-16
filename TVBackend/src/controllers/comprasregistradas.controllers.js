import sql from "mssql";
import { getConnection } from "../db/connection.js";
import {detalleNegocio} from "../controllers/detallenegocio.controllers.js";
import PDFDocument from "pdfkit";
import fs from "fs";

/* ============================
   LISTAR COMPRAS
================================ */
export const listarCompras = async (req, res) => {
  try {
    const pool = await sql.connect(getConnection);

    const result = await pool.request().query(`
  SELECT C.IdCompra, C.NumeroDocumento, C.MontoTotal, C.FechaRegistro,
         P.RazonSocial AS Proveedor, U.NombreCompleto AS Usuario
  FROM COMPRA C
  INNER JOIN PROVEEDOR P ON C.IdProveedor = P.IdProveedor
  INNER JOIN USUARIO U ON C.IdUsuario = U.IdUsuario
  ORDER BY C.IdCompra DESC
`);


    res.json(result.recordset);
  } catch (error) {
    console.error("Error al listar compras:", error);
    res.status(500).json({ message: "Error al listar compras" });
  }
};

//GENERAR PDF :

export const obtenerCompraPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(getConnection);

    const cabecera = await pool.request()
      .input("IdCompra", sql.Int, id)
      .query(`
        SELECT C.IdCompra, C.NumeroDocumento, C.MontoTotal, C.FechaRegistro,
               P.RazonSocial AS Proveedor, P.Documento AS DocumentoProveedor, U.NombreCompleto AS Usuario
        FROM COMPRA C
        INNER JOIN PROVEEDOR P ON C.IdProveedor = P.IdProveedor
        INNER JOIN USUARIO U ON C.IdUsuario = U.IdUsuario
        WHERE C.IdCompra = @IdCompra
      `);

    const detalle = await pool.request()
      .input("IdCompra", sql.Int, id)
      .query(`
        SELECT D.Cantidad, D.PrecioCompra, D.PrecioVenta, PR.Nombre, PR.Codigo
        FROM DETALLE_COMPRA D
        INNER JOIN PRODUCTO PR ON D.IdProducto = PR.IdProducto
        WHERE D.IdCompra = @IdCompra
      `);

    if (cabecera.recordset.length === 0) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.json({
      cabecera: cabecera.recordset[0],
      productos: detalle.recordset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener compra" });
  }
};



