// src/controllers/ventas.controllers.js
import sql from "mssql";
import { getConnection } from "../db/connection.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {generarCodigoAlfanumerico} from "../controllers/compras.controllers.js"

/*
 Expected POST payload (flexible):
 {
   IdUsuario: number,
   TipoDocumento: string,            // "Boleta" | "Factura"
   DocumentoCliente: number|string,  // IdCliente from clientes (or document string)
   Productos: [                      // or "Detalles"
     { IdProducto: number, Cantidad: number }
   ],
   MontoPago: number
 }
*/

export const listarVentas = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
       SELECT 
        IdVenta,
        TipoDocumento,
        NumeroDocumento,
        DocumentoCliente,
        NombreCliente,
        MontoPago,
        MontoCambio,
        MontoTotal,
        FechaRegistro
      FROM VENTA
      ORDER BY FechaRegistro DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error listar ventas:", error);
    res.status(500).json({ error: "Error al listar ventas" });
  }
};

export const obtenerDetalleVenta = async (req, res) => {
  const { IdVenta } = req.params;

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("IdVenta", sql.Int, IdVenta)
      .query(`
        SELECT dv.IdDetalleVenta,
               dv.IdVenta,
               dv.IdProducto,
               p.Nombre AS Producto,
               dv.PrecioVenta,
               dv.Cantidad,
               dv.Subtotal,
               dv.FechaRegistro
        FROM DETALLE_VENTA dv
        LEFT JOIN PRODUCTO p ON p.IdProducto = dv.IdProducto
        WHERE dv.IdVenta = @IdVenta
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error obtener detalle venta:", error);
    res.status(500).json({ error: "Error al obtener detalle de la venta" });
  }
};

export const registrarVenta = async (req, res) => {
  const {
    IdUsuario,
    TipoDocumento = "Boleta",
    DocumentoCliente,
    NombreCliente,
    Productos, // array [{ IdProducto, Cantidad }]
    // backwards compatibility
    Detalles,
    MontoPago = 0,
  } = req.body;

  const lineItems = Productos ?? Detalles;

  if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    return res.status(400).json({ error: "Debe enviar al menos un producto" });
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    // 1) Obtener precio y stock real de cada producto y calcular subtotales
    const itemsWithPrices = [];
    for (const item of lineItems) {
      const id = Number(item.IdProducto);
      const qty = Number(item.Cantidad);

      if (!id || !qty || qty <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: `Datos inválidos para producto ${JSON.stringify(item)}` });
      }

      const prodReq = new sql.Request(transaction);

      const prodRes = await prodReq
        .input("IdProducto", sql.Int, id)
        .query(`SELECT IdProducto, Nombre, PrecioVenta, Stock FROM PRODUCTO WHERE IdProducto = @IdProducto`);

      if (!prodRes.recordset || prodRes.recordset.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: `Producto ${id} no encontrado` });
      }

      const prod = prodRes.recordset[0];
      if (prod.Stock < qty) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Stock insuficiente para ${prod.Nombre} (Id ${id}). Disponible: ${prod.Stock}, solicitado: ${qty}`,
        });
      }

      const precio = Number(prod.PrecioVenta);
      const subtotal = parseFloat((precio * qty).toFixed(2));
      itemsWithPrices.push({
        IdProducto: id,
        Nombre: prod.Nombre,
        PrecioVenta: precio,
        Cantidad: qty,
        Subtotal: subtotal,
      });
    }

    // 2) Calcular total
    const MontoTotal = itemsWithPrices.reduce((s, it) => s + it.Subtotal, 0);

    if (Number(MontoPago) < Number(MontoTotal)) {
      await transaction.rollback();
      return res.status(400).json({ error: "MontoPago insuficiente para cubrir el total de la venta." });
    }

    const MontoCambio = parseFloat((Number(MontoPago) - Number(MontoTotal)).toFixed(2));

    const numeroDocGenerado =  generarCodigoAlfanumerico(10);

    // 3) Insertar VENTA y obtener IdVenta
    const insertVentaRes = await request
      .input("IdUsuario", sql.Int, IdUsuario ?? 0)
      .input("TipoDocumento", sql.VarChar(50), TipoDocumento)
      .input("NumeroDocumento", sql.VarChar(100), numeroDocGenerado)
      .input("DocumentoCliente", sql.VarChar(50), String(DocumentoCliente ?? ""))
      .input("NombreCliente", sql.VarChar(100), String(NombreCliente ?? ""))
      .input("MontoTotal", sql.Decimal(18, 2), MontoTotal)
      .input("MontoPago", sql.Decimal(18, 2), MontoPago)
      .input("MontoCambio", sql.Decimal(18, 2), MontoCambio)
      .query(`
        INSERT INTO VENTA
        (IdUsuario, TipoDocumento, NumeroDocumento, DocumentoCliente, NombreCliente, MontoTotal, MontoPago, MontoCambio)
        OUTPUT INSERTED.IdVenta
        VALUES
        (@IdUsuario, @TipoDocumento, @NumeroDocumento, @DocumentoCliente, @NombreCliente, @MontoTotal, @MontoPago, @MontoCambio)
      `);

    const IdVenta = insertVentaRes.recordset[0].IdVenta;

    // 4) Insertar cada detalle y actualizar stock
    

    for (const it of itemsWithPrices) {
      const detalleReq = new sql.Request(transaction);

  
      await detalleReq
        .input("IdVenta", sql.Int, IdVenta)
        .input("IdProducto", sql.Int, it.IdProducto)
        .input("PrecioVenta", sql.Decimal(18, 2), it.PrecioVenta)
        .input("Cantidad", sql.Int, it.Cantidad)
        .input("Subtotal", sql.Decimal(18, 2), it.Subtotal)
        .query(`
          INSERT INTO DETALLE_VENTA (IdVenta, IdProducto, PrecioVenta, Cantidad, Subtotal)
          VALUES (@IdVenta, @IdProducto, @PrecioVenta, @Cantidad, @Subtotal)
        `);

      // actualizar stock
      const stockReq = new sql.Request(transaction);

      await stockReq
        .input("IdProductoStock", sql.Int, it.IdProducto)
        .input("CantidadStock", sql.Int, it.Cantidad)
        .query(`
          UPDATE PRODUCTO
          SET Stock = Stock - @CantidadStock
          WHERE IdProducto = @IdProductoStock
        `);
    }

    await transaction.commit();

    // devolver info útil
    res.json({
      message: "Venta registrada con éxito",
      IdVenta,
      MontoTotal,
      MontoPago,
      MontoCambio,
    });
  } catch (error) {
    console.error("Error registrar venta:", error);
    try {
      await transaction.rollback();
    } catch (rerr) {
      console.error("Rollback error:", rerr);
    }
    res.status(500).json({ error: "Error al registrar la venta" });
  }
};

export const generarPDFVenta = async (req, res) => {
  const { IdVenta } = req.params;

  try {
    const pool = await getConnection();

    // 1) Datos de la venta
    const ventaQ = await pool.request()
      .input("IdVenta", sql.Int, IdVenta)
      .query(`
        SELECT v.*, u.NombreCompleto AS Usuario
        FROM VENTA v
        LEFT JOIN USUARIO u ON u.IdUsuario = v.IdUsuario
        WHERE v.IdVenta = @IdVenta
      `);

    if (!ventaQ.recordset || ventaQ.recordset.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }
    const venta = ventaQ.recordset[0];

    // 2) Detalles
    const detalleQ = await pool.request()
      .input("IdVenta", sql.Int, IdVenta)
      .query(`
        SELECT dv.*, p.Nombre AS Producto
        FROM DETALLE_VENTA dv
        LEFT JOIN PRODUCTO p ON p.IdProducto = dv.IdProducto
        WHERE dv.IdVenta = @IdVenta
      `);

    const detalles = detalleQ.recordset;

    // 3) Generar PDF con PDFKit
    const doc = new PDFDocument({ margin: 40 });
    const filename = `venta_${IdVenta}.pdf`;
    const filepath = path.join(process.cwd(), filename);
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Título centrado
    doc.fontSize(20).text("Registro de Venta", { align: "center" });
    doc.moveDown(1);

    // Información del cliente / venta
    doc.fontSize(12);
    doc.text(`ID Venta: ${venta.IdVenta}`);
    doc.text(`Cliente/Usuario: ${venta.Usuario ?? venta.IdUsuario}`);
    doc.text(`Documento: ${venta.TipoDocumento} ${venta.NumeroDocumento ?? ""}`);
    doc.text(`Fecha: ${new Date(venta.FechaRegistro).toLocaleString()}`);
    doc.moveDown(1);

    // Tabla de productos
    doc.fontSize(12).text("Productos:", { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemX = 50;
    const cantX = 250;
    const precioX = 300;
    const subtotalX = 400;

    // Encabezado
    doc.fontSize(10).text("Producto", itemX, tableTop, { bold: true });
    doc.text("Cantidad", cantX, tableTop);
    doc.text("Precio Unitario", precioX, tableTop);
    doc.text("Subtotal", subtotalX, tableTop);

    let i = 0;
    detalles.forEach(d => {
      const y = tableTop + 20 + i * 20;
      doc.text(d.Producto, itemX, y);
      doc.text(d.Cantidad, cantX, y);
      doc.text(`$${d.PrecioVenta}`, precioX, y);
      doc.text(`$${d.Subtotal}`, subtotalX, y);
      i++;
    });

    doc.moveDown(detalles.length + 2);

    // Totales
    doc.fontSize(12).text(`Total: $${venta.MontoTotal}`, { continued: false });
    doc.text(`Pago: $${venta.MontoPago}`);
    doc.text(`Cambio: $${venta.MontoCambio}`);
    doc.moveDown(1);

    doc.end();

    stream.on("finish", () => {
      res.download(filepath, filename, (err) => {
        if (err) console.error("Error al enviar PDF:", err);
        try { fs.unlinkSync(filepath); } catch(e) {}
      });
    });

  } catch (error) {
    console.error("Error generar PDF venta:", error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
};

