import { Router } from 'express';
import { loginUsuario } from '../controllers/login.controllers.js';

const router = Router();

// POST /api/login
router.post('/login', loginUsuario);

export default router;