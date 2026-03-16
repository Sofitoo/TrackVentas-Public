import express from "express";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria, } from "../controllers/categorias.controllers.js";
import cors from 'cors';

const router = express.Router();

router.get("/", getCategorias); // /categorias

router.post("/create", createCategoria); //crear categoria

router.put("/update/:id", updateCategoria); //actualizar categoria

router.delete("/delete/:id", deleteCategoria); //eliminar categoria


export default router;