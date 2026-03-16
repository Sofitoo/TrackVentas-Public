import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../api/axiosConfig";

interface Categoria {
  IdCategoria: string;
  Descripcion: string;
  Estado: boolean;
  FechaRegistro: string;
}

const ConfiguracionCategoria: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    Descripcion: "",
    Estado: true,
  });

  // Traer categorías del backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get('/categoria');
        setCategorias(res.data);
      } catch (error) {
        console.error(error);
        alert("Error al obtener categorías");
      }
    };
    fetchCategorias();
  }, []);

  // Manejo de cambios en formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Crear o editar categoría
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Editar
        await api.put(
          `http://localhost:5000/categoria/update/${editingId}`,
          formData
        );
        setCategorias((prev) =>
          prev.map((c) =>
            c.IdCategoria === editingId ? { ...c, ...formData } : c
          )
        );
        alert("Categoría actualizada correctamente");
      } else {
        // Crear nueva categoría
        const res = await api.post(
          "/categoria/create",
          formData
        );
        setCategorias([...categorias, res.data]);
        alert("Categoría agregada correctamente");
      }

      setFormData({ Descripcion: "", Estado: true });
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la categoría");
    }
  };

  // Cargar datos al formulario para editar
  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.IdCategoria);
    setFormData({
      Descripcion: categoria.Descripcion,
      Estado: categoria.Estado,
    });
  };

  // Eliminar categoría
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;
    try {
      await api.delete(`http://localhost:5000/categoria/delete/${id}`);
      setCategorias(categorias.filter((c) => c.IdCategoria !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la categoría");
    }
  };

  return (
    <div className="page">
      <h1 className="text-2xl font-bold">Configuración - Categorías</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          name="Descripcion"
          placeholder="Descripción"
          value={formData.Descripcion}
          onChange={handleChange}
          required
        />
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

        <button type="submit">
          {editingId ? "Guardar Cambios" : "Agregar Categoría"}
        </button>
      </form>

      {/* Lista de categorías */}
      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.IdCategoria}>
              <td>{c.IdCategoria}</td>
              <td>{c.Descripcion}</td>
              <td>{c.Estado ? "Activo" : "Inactivo"}</td>
              <td>{c.FechaRegistro}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Editar</button>
                <button onClick={() => handleDelete(c.IdCategoria)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfiguracionCategoria;