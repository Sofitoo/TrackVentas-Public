import { Router } from "express";
import { listarCompras, obtenerCompraPorId } from "../controllers/comprasregistradas.controllers.js";

const router = Router();

router.get("/compras", listarCompras);
//router.get("/compras/:id/pdf", obtenerPDFCompra);
// comprasregistradas.routes.ts
router.get("/compras/:id", obtenerCompraPorId);


export default router;
