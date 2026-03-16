import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axios.ts";

interface Proveedor {
  IdProveedor: number;
  Documento: string;
  RazonSocial: string;
  Correo: string;
  Telefono: string;
  Estado: boolean;
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [editando, setEditando] = useState<Proveedor | null>(null);

  const [form, setForm] = useState({
    Documento: "",
    RazonSocial: "",
    Correo: "",
    Telefono: "",
    Estado: true,
  });

  const cargarProveedores = async () => {
    const res = await api.get("/api/proveedores/full");
    setProveedores(res.data);
  };

  useEffect(() => {
    console.log("LISTA DE PROVEEDORES:", proveedores);
    cargarProveedores();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const crearProveedor = async (e: any) => {
    e.preventDefault();
    await api.post("/api/crearprov", form);
    cargarProveedores();

    setForm({
      Documento: "",
      RazonSocial: "",
      Correo: "",
      Telefono: "",
      Estado: true,
    });
  };

  const eliminarProveedor = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;

    await api.delete(`http://localhost:5000/api/eliminarprov/${id}`);
    cargarProveedores();
  };

  const abrirEdicion = (prov: Proveedor) => {
    setEditando(prov);
  };

  const guardarEdicion = async (e: any) => {
    e.preventDefault();

    if (!editando) return;

    await api.put(`http://localhost:5000/api/editarprov/${editando.IdProveedor}`, editando);
    setEditando(null);
    cargarProveedores();
  };

  const handleEditChange = (e: any) => {
    if (!editando) return;
    setEditando({ ...editando, [e.target.name]: e.target.value });
  };

  


  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ================= FORMULARIO CREAR ================= */}
      <h1 className="text-2xl font-bold mb-4">Registrar Proveedor</h1>

      <form onSubmit={crearProveedor} className="grid grid-cols-2 gap-4 mb-10 bg-white p-4 rounded shadow">

        <input
          placeholder="Documento"
          name="Documento"
          value={form.Documento}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Razón Social"
          name="RazonSocial"
          value={form.RazonSocial}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Correo"
          type="Email"
          name="Correo"
          value={form.Correo}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Teléfono"
          name="Telefono"
          value={form.Telefono}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <div className="flex items-center gap-3 mt-2">
  <span
    className={`font-medium ${
      form.Estado ? "text-green-600" : "text-red-600"
    }`}
  >
    {form.Estado ? "Activo" : "Inactivo"}
  </span>

  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={form.Estado}
      onChange={(e) =>
        setForm({ ...form, Estado: e.target.checked })
      }
    />

    {/* Fondo del toggle */}
    <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>

    {/* Botón que se desliza */}
    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7"></div>
  </label>
</div>


        <button className="bg-blue-600 text-white p-2 rounded col-span-2">
          Guardar
        </button>
      </form>

      {/* ================= TABLA LISTADO ================= */}
      <h2 className="text-xl font-bold mb-2">Lista de Proveedores</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Documento</th>
            <th className="p-2 border">Razón Social</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border w-32">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {proveedores.map((p) => (
            <tr key={p.IdProveedor}>
              <td className="border p-2">{p.Documento}</td>
              <td className="border p-2">{p.RazonSocial}</td>
              <td className="border p-2">{p.Correo}</td>
              <td className="border p-2">{p.Telefono}</td>
              <td className="border p-2">
                {p.Estado ? "ACTIVO" : "INACTIVO"}
              </td>
              <td className="border p-2 flex gap-2 justify-center">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => abrirEdicion(p)}
                >
                  Editar
                </button>

                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => eliminarProveedor(p.IdProveedor)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL DE EDICIÓN ================= */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Editar Proveedor</h2>

            <form onSubmit={guardarEdicion} className="grid grid-cols-2 gap-4">

              <input
                name="Documento"
                value={editando.Documento}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />

              <input
                name="RazonSocial"
                value={editando.RazonSocial}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />

              <input
                name="Correo"
                value={editando.Correo}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />

              <input
                name="Telefono"
                value={editando.Telefono}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />

              <div className="flex items-center gap-3">
  <span
    className={`font-medium ${
      editando.Estado ? "text-green-600" : "text-red-600"
    }`}
  >
    {editando.Estado ? "Activo" : "Inactivo"}
  </span>

  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      name="Estado"
      checked={editando.Estado}
      onChange={(e) =>
        handleEditChange({
          target: {
            name: "Estado",
            value: e.target.checked,
          },
        })
      }
      className="sr-only peer"
    />

    <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>

    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7"></div>
  </label>
</div>

                


              <button className="bg-green-600 text-white p-2 rounded col-span-2">
                Guardar Cambios
              </button>
            </form>

            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full"
              onClick={() => setEditando(null)}
            >
              Cancelar
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
