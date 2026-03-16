import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  
  // Estados por separado 👇
  const [openConfig, setOpenConfig] = useState(false);
  const [openCompras, setOpenCompras] = useState(false);

  const navigate = useNavigate();

  // Refs separados 👇
  const configRef = useRef<HTMLDivElement>(null);
  const comprasRef = useRef<HTMLDivElement>(null);

   // 🔐 LOGOUT REAL
  const handleLogout = () => {
    onLogout();
    localStorage.clear();
    navigate('/login');
  };

  // Toggle independientes 👇
  const toggleConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenConfig(!openConfig);
    setOpenCompras(false); // Cierra el otro
  };

  const toggleCompras = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCompras(!openCompras);
    setOpenConfig(false); // Cierra el otro
  };

  // Cerrar cuando se cliquea afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        configRef.current &&
        !configRef.current.contains(event.target as Node)
      ) {
        setOpenConfig(false);
      }

      if (
        comprasRef.current &&
        !comprasRef.current.contains(event.target as Node)
      ) {
        setOpenCompras(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar al hacer click en una opción
  const closeAll = () => {
    setOpenConfig(false);
    setOpenCompras(false);
  };

  return (
    <nav className="navbar">
      <ul className='navbar-list'>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/usuarios">Usuarios</Link></li>

        {/* Dropdown Configuración */}
        <li className="dropdown-container">
          <div ref={configRef} className="dropdown">
            <span className="dropdown-toggle" onClick={toggleConfig}>
              Configuración
            </span>

            {openConfig && (
              <ul className="dropdown-menu">
                <li><Link to="/configuracion/productos" onClick={closeAll}>Productos</Link></li>
                <li><Link to="/configuracion/categoria" onClick={closeAll}>Categoría</Link></li>
                <li><Link to="/configuracion/detalle-negocio" onClick={closeAll}>Detalle de Negocio</Link></li>
              </ul>
            )}
          </div>
        </li>

        <li><Link to="/ventas">Ventas</Link></li>

        {/* Dropdown Compras */}
        <li className="dropdown-container">
          <div ref={comprasRef} className="dropdown">
            <span className="dropdown-toggle" onClick={toggleCompras}>
              Compras
            </span>

            {openCompras && (
              <ul className="dropdown-menu">
                <li><Link to="/compras/compras" onClick={closeAll}>Compras</Link></li>
                <li><Link to="/compras/comprasregistradas" onClick={closeAll}>Compras Registradas</Link></li>
              </ul>
            )}
          </div>
        </li>

        <li><Link to="/clientes">Clientes</Link></li>
        <li><Link to="/proveedores">Proveedores</Link></li>

        <li>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
