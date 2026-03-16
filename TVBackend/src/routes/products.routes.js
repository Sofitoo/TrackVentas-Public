import {Router} from 'express'
import cors from 'cors';
import { getProducts, createProducto, updateProducto, deleteProducto } from '../controllers/products.controllers.js';

const router = Router();


//listado
router.get('/products', getProducts);

//crear productos
router.post('/products/create', createProducto);

//editar productos
router.put('/products/update/:id', updateProducto );

//eliminar productos

router.delete('/products/delete/:id', deleteProducto);


export default router;