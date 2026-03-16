 // src/pages/Configuracion.tsx
  import React from 'react';
  const Configuracion: React.FC = () => {
    return (
      <div className="page">
        <h1>Configuración</h1>
        <p>Aquí configurarás opciones de la app (ej. temas, notificaciones).</p>
        <form>
          <label>Opción 1: <input type="checkbox" /></label>
        </form>
      </div>
    );
  };
  export default Configuracion;
  