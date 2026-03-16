import React, {useEffect, useState} from 'react';
import axios from 'axios';
import api from "../api/axiosConfig";

interface Cliente {
  IdCliente: number;
  Documento: string;
  NombreCompleto: string;
  Correo: string;
  Telefono: string;
  Estado: boolean;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editando, setEditando] = useState<Cliente | null>(null);

  const [form, setForm] = useState({
    Documento: "",
    NombreCompleto: "",
    Correo: "",
    Telefono: "",
    Estado: true,
  });

  const cargarClientes = async () => {
    const res = await api.get("/api/clientes");
    setClientes(res.data);
  };

  useEffect(() => {
    console.log("LISTA DE CLIENTES", clientes);
    cargarClientes();
  }, []);

  const handleChange = (e: any) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const crearCliente = async (e: any) => {
    e.preventDefault();
    await api.post("/api/crearcliente", form);
    cargarClientes();

    setForm({
      Documento: "",
      NombreCompleto: "",
      Correo: "",
      Telefono: "",
      Estado: true,
    });
  };

  const eliminarCliente = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    await api.delete(`http://localhost:5000/api/eliminarcliente/${id}`);
    cargarClientes();
  };

  const abrirEdicion = (cli: Cliente) => {
    setEditando(cli);
  };
  const guardarEdicion = async (e: any) => {
    e.preventDefault();

    if (!editando) return;

    await api.put(`/api/editarcliente/${editando.IdCliente}`, editando);
    setEditando(null);
    cargarClientes();
  };

  const handleEditChange = (e: any) => {
    if (!editando) return;
    setEditando({ ...editando, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ================= FORMULARIO CREAR ================= */}
      <h1 className="text-2xl font-bold mb-4">Registrar Cliente</h1>

      <form onSubmit={crearCliente} className="grid grid-cols-2 gap-4 mb-10 bg-white p-4 rounded shadow">

        <input
          placeholder="Documento"
          name="Documento"
          value={form.Documento}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Nombre Completo"
          name="NombreCompleto"
          value={form.NombreCompleto}
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

        <div className="flex items-center gap-3">
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
      name="Estado"
      checked={form.Estado}
      onChange={(e) =>
        setForm({ ...form, Estado: e.target.checked })
      }
      className="sr-only peer"
    />

    <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>

    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7"></div>
  </label>
</div>



        <button className="bg-blue-600 text-white p-2 rounded col-span-2">
          Guardar
        </button>
      </form>

      {/* ================= TABLA LISTADO ================= */}
      <h2 className="text-xl font-bold mb-2">Lista de Clientes</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Documento</th>
            <th className="p-2 border">Nombre Completo</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border w-32">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((p) => (
            <tr key={p.IdCliente}>
              <td className="border p-2">{p.Documento}</td>
              <td className="border p-2">{p.NombreCompleto}</td>
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
                  onClick={() => eliminarCliente(p.IdCliente)}
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
            <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>

            <form onSubmit={guardarEdicion} className="grid grid-cols-2 gap-4">

              <input
                name="Documento"
                value={editando.Documento}
                onChange={handleEditChange}
                className="border p-2 rounded"
              />

              <input
                name="NombreCompleto"
                value={editando.NombreCompleto}
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