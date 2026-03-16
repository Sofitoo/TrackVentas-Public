import express from "express";
import config  from "./config.js";

import productsRoutes from './routes/products.routes.js';
import usersRouter from './routes/users.routes.js';
import loginRoutes from './routes/login.routes.js';
import categoriaRoutes from "./routes/categorias.routes.js";
import comprasRoutes from "./routes/compras.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";
import comprasRegistradasRoutes from "./routes/comprasregistradas.routes.js"
import detalleNegocioRoutes from "./routes/detallenegocio.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import ventasRouter from "./routes/ventas.routes.js";

import cors from 'cors';
import { authMiddleware } from "./middlewares/authMiddleware.js";

const app = express();

//MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// SETTINGS (PORT)
app.set('port', config.port);

// RUTA SIN TOKEN (PUBLICAS)---------------------
//LOGIN
app.use('/login', loginRoutes);

// RUTAS CON TOKEN OBLIGATORIO--------------------
app.use(authMiddleware);

//PRODUCTOS
app.use("/api", productsRoutes); // todas las rutas de products van a /api/products

//USUARIOS
app.use('/users', usersRouter);

//CATEGORIAS
app.use("/categoria", categoriaRoutes);

//COMPRAS
app.use('/compras', comprasRoutes);

//COMPRAS REGISTRADAS
app.use("/api", comprasRegistradasRoutes);

//PROVEEDORES
app.use('/api', proveedoresRoutes);

//DETALLE NEGOCIO SIN DB
app.use("/detallenegocio", detalleNegocioRoutes);

//CLIENTES
app.use('/api', clientesRoutes);

//VENTAS
app.use("/api", ventasRouter);

export default app