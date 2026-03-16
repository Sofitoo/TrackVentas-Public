import { Router } from "express";
import {
  obtenerDetalleNegocio,
  guardarDetalleNegocio,
} from "../controllers/detallenegocio.controllers.js";

const router = Router();

// GET → obtener
router.get("/", obtenerDetalleNegocio);

// POST → guardar
router.post("/", guardarDetalleNegocio);

export default router;
