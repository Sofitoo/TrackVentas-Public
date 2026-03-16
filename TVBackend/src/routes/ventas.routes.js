// src/routes/ventas.routes.js
import { Router } from "express";
import {
  listarVentas,
  registrarVenta,
  obtenerDetalleVenta,
  generarPDFVenta,
} from "../controllers/ventas.controllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleAuth } from "../middlewares/roleAuth.js";

const router = Router();

// Listar todas las ventas
router.get("/ventas", authMiddleware, roleAuth([ 1, 2]), listarVentas);

// Registrar venta (body: ver arriba)
router.post("/ventas/registrar", authMiddleware, roleAuth([ 1, 2]), registrarVenta);

// Obtener detalle por IdVenta
router.get("/ventas/detalle/:IdVenta", authMiddleware, roleAuth([ 1, 2]), obtenerDetalleVenta);

// Generar / descargar PDF de la venta
router.get("/ventas/pdf/:IdVenta", authMiddleware, roleAuth([ 1, 2]), generarPDFVenta);

// GET /api/ventas/:IdVenta/productos
router.get("/ventas/:IdVenta/productos", authMiddleware, roleAuth([1,2]), obtenerDetalleVenta);


export default router;
