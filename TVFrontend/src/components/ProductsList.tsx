 import React, { useState, useEffect } from 'react';
  import axios from 'axios'; 
  // Interfaz TypeScript para productos
  interface Product {
    IdProducto: number;
    IdCategoria: number;
    Codigo: string;
    Nombre: string;  
    Descripcion: string;
    Stock: number;
    PrecioCompra: number;
    PrecioVenta: number;
    Estado: boolean;
    FechaRegistro: string ;
   
  }
  const ProductsList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setError(null);
          // Opción 1: Con proxy (recomendado) - llama a /api/products
          const response = await axios.get('/api/products');

          console.log('Datos recibidos:', response.data);  // Para debug en consola
          setProducts(response.data);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
          setError(`Error al cargar productos: ${errorMsg}`);
          console.error('Error en fetch:', err);
        } finally {
          setLoading(false);
        }
      };
       fetchProducts();
    }, []);  // Se ejecuta solo al montar el componente
    if (loading) {
      return <div className="loading">Cargando productos...</div>;  // Estilos CSS 
    }
    if (error) {
      return <div className="error" style={{ color: 'red' }}>{error}</div>;
    }
    return (
      <div className="products-list">
        <h1>Lista de Productos desde SQL Server</h1>
        {products.length > 0 ? (
          <ul>
            {products.map((product) => (
              <li key={product.IdProducto} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
                <strong>IdProducto:</strong> {product.IdProducto} <br />
                <strong>IdCategoria:</strong> {product.IdCategoria} <br />
                <strong>Codigo:</strong> {product.Codigo} <br />
                <strong>Nombre:</strong> {product.Nombre} <br />
                <strong>Descripicion:</strong> {product.Descripcion} <br />
                <strong>Stock:</strong> {product.Stock} <br />
                <strong>PrecioCompra:</strong> ${product.PrecioCompra || 'N/A'} <br />
                <strong>PrecioVenta:</strong> ${product.PrecioVenta || 'N/A'} <br />
                <strong>FechaRegistro:</strong> {product.FechaRegistro} <br />
                {}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay productos disponibles en la base de datos.</p>
        )}
      </div>
    );
  };
  export default ProductsList;