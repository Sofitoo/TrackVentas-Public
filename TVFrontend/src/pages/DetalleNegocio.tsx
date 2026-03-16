// src/pages/DetalleNegocio.tsx
import React,{ useState} from 'react';
import axios from 'axios';

const DetalleNegocio: React.FC = () => {
  const [cuit, setCuit] = useState(localStorage.getItem("cuit") || "");
  const [direccion, setDireccion] = useState(localStorage.getItem("direccion") || "");
  const [telefono, setTelefono] = useState(localStorage.getItem("telefono") || "");

const guardarNegocio = async () => {
    try {
      // 1) Guardar en backend
      await axios.post("http://localhost:5000/detallenegocio", {
        cuit,
        direccion,
        telefono
      });

      // 2) Guardar en localStorage (opcional)
      localStorage.setItem("cuit", cuit);
      localStorage.setItem("direccion", direccion);
      localStorage.setItem("telefono", telefono);

      alert("Datos guardados");

    } catch (error) {
      console.error("Error guardando detalle:", error);
      alert("Error al guardar");
    }
  };

  return (

    <div className="card">
  <h3 className="text-2xl font-bold">Detalle del Negocio</h3>

  <div className="row">
    <label>CUIT</label>
    <input
      value={cuit}
      onChange={(e) => setCuit(e.target.value)}
    />
  </div>

  <div className="row">
    <label>Dirección</label>
    <input
      value={direccion}
      onChange={(e) => setDireccion(e.target.value)}
    />
  </div>

  <div className="row">
    <label>Teléfono</label>
    <input
      value={telefono}
      onChange={(e) => setTelefono(e.target.value)}
    />
  </div>

  <button onClick={guardarNegocio}>Guardar Datos</button>
</div>

    /*<div className="page">
      <h1>Configuración - Detalle de Negocio</h1>
      <p>Aquí editarás info general del negocio (nombre, dirección, etc.).</p>
      <form>
        <label>Nombre del Negocio: <input type="text" placeholder="TrackVentas" /></label>
        <label>Dirección: <input type="text" placeholder="Calle Falsa 123" /></label>
        <button type="submit">Guardar</button>
      </form>
    </div>*/
  );
};
export default DetalleNegocio;