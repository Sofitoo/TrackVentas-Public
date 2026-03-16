import express from "express";
import { obtenerProveedores, crearProveedor, eliminarProveedor, actualizarProveedor, obtenerProveedoresFull } from "../controllers/proveedores.controllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleAuth } from "../middlewares/roleAuth.js";

const router = express.Router();

router.get("/proveedores",authMiddleware, roleAuth([ 1, 2]), obtenerProveedores);
router.get("/proveedores/full",authMiddleware, roleAuth([ 1, 2]), obtenerProveedoresFull);
router.post("/crearprov",authMiddleware, roleAuth([ 1, 2]), crearProveedor);
router.put("/editarprov/:id",authMiddleware, roleAuth([ 1, 2]), actualizarProveedor);
router.delete("/eliminarprov/:id",authMiddleware, roleAuth([ 1 ]), eliminarProveedor);

export default router;
