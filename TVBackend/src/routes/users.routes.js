import express from 'express';
import { Router } from "express";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../controllers/users.controllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleAuth } from '../middlewares/roleAuth.js';
import cors from "cors";

const router = express.Router();

router.get('/users', authMiddleware, roleAuth([1]), getUsuarios);
router.post('/create', authMiddleware, roleAuth([1]), createUsuario);
// Editar usuario
router.put("/update/:id", authMiddleware, roleAuth([1]), updateUsuario);

// Eliminar usuario
router.delete("/delete/:id", authMiddleware, roleAuth([1]), deleteUsuario);

export default router;