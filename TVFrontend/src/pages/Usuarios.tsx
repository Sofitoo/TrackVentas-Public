import React, { useState, useEffect } from 'react';
import axios from "../api/axiosConfig";
import api from "../api/axiosConfig";



interface UserFormData {
  IdUsuario: number;
  Documento: string;
  NombreCompleto: string;
  Correo: string;
  Clave: string;
  IdRol: number;
  Estado: boolean;
  FechaRegistro: string;
}


const CreateUserForm: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UserFormData[]>([]);
  const [formData, setFormData] = useState({
    Documento: "",
    NombreCompleto: "",
    Correo: "",
    Clave: "",
    IdRol: "",
    Estado: true,
  });
  //modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Traer usuarios del backend
  useEffect(() => {
  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/users/users'); // tu endpoint backend
      setUsuarios(res.data); // guarda los usuarios en el estado
    } catch (error) {
      console.error(error);
      alert("Error al obtener los usuarios");
    }
  };

  fetchUsuarios();
}, []);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const target = e.target;

  // Si es un input de tipo checkbox
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    const { name, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  } else {
    // Para inputs normales y selects
    const { name, value } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const nuevoUsuario = {
    Documento: formData.Documento,
    NombreCompleto: formData.NombreCompleto,
    Correo: formData.Correo,
    Clave: formData.Clave,
    IdRol: Number(formData.IdRol),
    Estado: formData.Estado,
  };

 try {
      if (editingUserId) {
        // 🔄 EDITAR USUARIO
        await api.put(`http://localhost:5000/users/update/${editingUserId}`, nuevoUsuario);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.IdUsuario === editingUserId
              ? { ...u, ...nuevoUsuario, IdUsuario: editingUserId }
              : u
          )
        );
        alert("Usuario actualizado correctamente ✅");
      } else {
        // 🆕 CREAR USUARIO
        const res = await api.post("http://localhost:5000/users/create", nuevoUsuario);
        setUsuarios(prev => [...prev, res.data.user]);
        //setUsuarios([...usuarios, res.data.user]);
        alert("Usuario creado correctamente 🎉");
      }

      // Cerrar modal y resetear formulario
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el usuario");
    }
  };
  // Eliminar usuario
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que querés eliminar este usuario?")) return;
    try {
      await api.delete(`http://localhost:5000/users/delete/${id}`);
      setUsuarios(usuarios.filter((u) => u.IdUsuario !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el usuario");
    }
  };

  // Editar usuario
  const handleEdit = (usuario: UserFormData) => {
    setEditingUserId(usuario.IdUsuario);
    setFormData({
      Documento: usuario.Documento,
      NombreCompleto: usuario.NombreCompleto,
      Correo: usuario.Correo,
      Clave: "", // no se muestra la clave existente
      IdRol: usuario.IdRol.toString(),
      Estado: usuario.Estado,
    });
    setModalOpen(true);
  };

  // Cerrar modal y resetear formulario
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUserId(null);
    setFormData({
      Documento: "",
      NombreCompleto: "",
      Correo: "",
      Clave: "",
      IdRol: "",
      Estado: true,
    });

};
 return (
    // Wrapper principal: ocupa todo ancho y centra el contenido
    <div className="w-full min-h-screen bg-gray-50 py-10">
      {/* Container centrado con ancho mayor: ajustá max-w según quieras */}
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Card blanco con sombra y padding */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-700 mb-4">Gestión de Usuarios</h1>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 !bg-green-500 !hover:bg-green-600 text-white rounded-lg shadow-sm"
              >
                + Crear Usuario
              </button>

              {/* Lista de usuarios: ocupa la columna principal */}
              <div className="mt-6">
                <ul className="space-y-4 max-h-[56vh] overflow-y-auto pr-2">
                  {usuarios.length > 0 ? (
                    usuarios.map(u => (
                      <li key={u.IdUsuario} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">{u.NombreCompleto}</p>
                          <p className="text-sm text-gray-500">{u.Correo}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Rol: {u.IdRol === 1 ? "Admin" : "Empleado"} | {u.Estado ? "Activo" : "Inactivo"}
                          </p>

                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(u)} className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">Editar</button>
                            <button onClick={() => handleDelete(u.IdUsuario)} className="px-3 py-1 rounded-md bg-red-500 text-white text-sm">Eliminar</button>
                          </div>
                          <span className="text-sm text-gray-400">{u.FechaRegistro ? new Date(u.FechaRegistro).toLocaleDateString() : ""}</span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No hay usuarios registrados</li>
                  )}
                </ul>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      {/* MODAL (simple) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{editingUserId ? "Editar Usuario" : "Crear Usuario"}</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Documento</label>
                <input name="Documento" value={formData.Documento} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <input name="NombreCompleto" value={formData.NombreCompleto} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo</label>
                <input name="Correo" value={formData.Correo} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Clave</label>
                <input name="Clave" value={formData.Clave} onChange={handleChange} placeholder={editingUserId ? "Dejar vacío si no se cambia" : ""} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select name="IdRol" value={formData.IdRol} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-200 shadow-sm">
                  <option value="">Selecciona un Rol</option>
                  <option value="1">Admin</option>
                  <option value="2">Empleado</option>
                </select>
              </div>

              {/* Estado (Activo / Inactivo) */}
<div className="flex items-center justify-between my-3">
  <label className="text-gray-700 font-semibold">Estado:</label>

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
        className="sr-only peer"
        checked={formData.Estado}
        onChange={(e) =>
          setFormData({ ...formData, Estado: e.target.checked })
        }
      />

      {/* Fondo del toggle */}
      <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>

      {/* Botoncito del toggle */}
      <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7"></div>
    </label>
  </div>
</div>


              <div className="col-span-1 md:col-span-2 flex justify-between mt-4">
                <div />
                <div className="flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-300">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-md bg-green-500 text-white">{editingUserId ? "Guardar cambios" : "Crear usuario"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

};

export default CreateUserForm;