import { Router } from "express";
import { registrarCompra, listarProveedores, listarProductos } from "../controllers/compras.controllers.js";

const router = Router();

// obtener proveedores
router.get("/", listarProveedores);

// obtener productos
router.get("/products", listarProductos);

// registrar compra
router.post("/registrar", registrarCompra);

export default router;
