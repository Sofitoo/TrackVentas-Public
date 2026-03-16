import express from "express";
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from "../controllers/clientes.controllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleAuth } from "../middlewares/roleAuth.js";

const router = express.Router();

router.get("/clientes", authMiddleware, roleAuth([ 1, 2]), obtenerClientes);
router.post("/crearcliente", authMiddleware, roleAuth([ 1, 2]), crearCliente);
router.put("/editarcliente/:id", authMiddleware, roleAuth([ 1, 2]), actualizarCliente);
router.delete("/eliminarcliente/:id", authMiddleware, roleAuth([1]), eliminarCliente);

export default router;