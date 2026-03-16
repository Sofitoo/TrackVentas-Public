// src/pages/ConfiguracionProductos.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from "../api/axiosConfig";

interface ProductsFormData {
  IdProducto: string;
  IdCategoria: number;
  Codigo: string;
  Nombre: string;
  Descripcion: string;
  Stock: number;
  PrecioCompra: number;
  PrecioVenta: number;
  Estado: boolean;
  FechaRegistro: string;
}

interface Categoria {
  IdCategoria: number;
  Descripcion: string;
}

const CargarProductos: React.FC = () => {
  const [productos, setProductos] = useState<ProductsFormData[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    Codigo: "",
    Nombre: "",
    Descripcion:"",
    IdCategoria: "",
    Estado:true,
  });

  //traer productos del backend
  // Traer productos y categorías
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await api.get('/api/products');
        setProductos(res.data);
      } catch (error) {
        console.error(error);
        alert("Error al obtener los productos");
      }
    };
  const fetchCategorias = async () => {
    try {
      const res = await api.get('/categoria'); // endpoint de categorías
      setCategorias(res.data);
    } catch (error) {
      console.error(error);
      alert("Error al obtener las categorías");
    }
  };

  fetchProductos();
  fetchCategorias();
},[]); //fin del useeffect de traer productos


  //maneja los cambios en el formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    if (type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Guardar producto (crear o editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoProducto = {
      Codigo: formData.Codigo,
      Nombre: formData.Nombre,
      Descripcion: formData.Descripcion,
      IdCategoria: Number(formData.IdCategoria),
      Estado: formData.Estado,
    };

    try {
      if (editingProductId) {
        // Editar producto
        await api.put(
          `http://localhost:5000/api/products/update/${editingProductId}`,
          nuevoProducto
        );
        setProductos((prev) =>
          prev.map((p) =>
            p.IdProducto === editingProductId
              ? { ...p, ...nuevoProducto, IdProducto: editingProductId }
              : p
          )
        );
        alert("Producto actualizado correctamente");
      } else {
        // Crear producto nuevo
        const res = await api.post(
          "http://localhost:5000/api/products/create",
          nuevoProducto
        );
        if (res.data?.producto) {
          setProductos([...productos, res.data.producto]);
}
        //setProductos([...productos, res.data]);
        //setProductos(prev => [...prev, res.data.productos]);
        alert("Producto agregado correctamente");
      }

      // Limpiar formulario
      limpiarFormulario();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    }
  };

  // Cancelar edición y limpiar formulario
  const limpiarFormulario = () => {
    setFormData({
      Codigo: "",
      Nombre: "",
      Descripcion: "",
      IdCategoria: "",
      Estado: true,
    });
    setEditingProductId(null);
  };


  //eliminar producto
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿seguro que quieres eliminar este producto?")) return;
    try {
      await api.delete(`http://localhost:5000/api/products/delete/${id}`);
      setProductos(productos.filter((p) => p.IdProducto !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el producto");
    }
  }

  // Editar producto (cargar datos al formulario)
  const handleEdit = (producto: ProductsFormData) => {
    setEditingProductId(producto.IdProducto);
    setFormData({
      Codigo: producto.Codigo,
      Nombre: producto.Nombre,
      Descripcion: producto.Descripcion,
      IdCategoria: producto.IdCategoria.toString(),
      Estado: producto.Estado,
    });
  };

       return (
    <div className="page">
      <h1 className="text-2xl font-bold">Configuración - Productos</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="Codigo"
          placeholder="Código"
          value={formData.Codigo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="Nombre"
          placeholder="Nombre"
          value={formData.Nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="Descripcion"
          placeholder="Descripción"
          value={formData.Descripcion}
          onChange={handleChange}
        />

        <select
          name="IdCategoria"
          value={formData.IdCategoria}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((c) => (
            <option key={c.IdCategoria} value={c.IdCategoria}>
              {c.Descripcion}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
  <span
    className={`font-medium ${
      formData.Estado ? "text-green-600" : "text-red-600"
    }`}
  >
    {formData.Estado ? "Activo" : "Inactivo"}
  </span>

  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      name="Estado"
      checked={formData.Estado}
      onChange={handleChange}
      className="sr-only peer"
    />

    {/* Fondo del toggle */}
    <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>

    {/* Botón móvil */}
    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7"></div>
  </label>
</div>


        {/* 🔹 Botones */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="submit">
            {editingProductId ? "Guardar Cambios" : "Agregar Producto"}
          </button>

          {editingProductId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              style={{ backgroundColor: "#aaa", color: "white" }}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Stock</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.IdProducto}>
              <td>{p.Codigo}</td>
              <td>{p.Nombre}</td>
              <td>{p.Descripcion}</td>
              <td>
                {categorias.find((c) => c.IdCategoria === p.IdCategoria)?.Descripcion ||
                  "Sin categoría"}
              </td>
              <td>{p.Estado ? "Activo" : "Inactivo"}</td>
              <td>{p.Stock ?? ""}</td>
              <td>{p.PrecioCompra ?? ""}</td>
              <td>{p.PrecioVenta ?? ""}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.IdProducto)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};
export default CargarProductos;
