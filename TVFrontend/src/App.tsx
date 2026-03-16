import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';

import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import ConfiguracionProductos from './pages/ConfiguracionProductos';
import ConfiguracionCategoria from './pages/ConfiguracionCategoria';
import DetalleNegocio from './pages/DetalleNegocio';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import ComprasRegistradas from './pages/ComprasRegistradas';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';

import './App.css';

// 🔥 Funciones para obtener token y rol
const getToken = () => localStorage.getItem("token");
const getRol = () => Number(localStorage.getItem("rol")); // 1 admin / 2 empleado

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rol");
  }, []);

  const handleLogin = (usuario: any, token: string) => {
    // Guardar token y usuario solo al loguear
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));
    localStorage.setItem("rol", usuario.rol.toString());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rol");
    setIsLoggedIn(false);
  };

  // 🔐 ProtectedRoute con roles
  const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: number[] }> = ({
    children,
    allowedRoles,
  }) => {
    const token = getToken();
    const rol = getRol();

    if (!token) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(rol)) return <Navigate to="/home" />;

    return <>{children}</>;
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar solo si está logueado */}
        {isLoggedIn && <Navbar onLogout={handleLogout} />}

        <main>
          <Routes>
            {/* Login siempre público */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            {/* Home */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <Navigate to="/configuracion/productos" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/productos"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ConfiguracionProductos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/categoria"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <ConfiguracionCategoria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion/detalle-negocio"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <DetalleNegocio />
                </ProtectedRoute>
              }
            />

            {/* ADMIN + EMPLEADO */}
            <Route
              path="/ventas"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Ventas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compras"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Navigate to="/compras/compras" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compras/compras"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Compras />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compras/comprasregistradas"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <ComprasRegistradas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Proveedores />
                </ProtectedRoute>
              }
            />

            {/* Ruta raíz */}
            <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


