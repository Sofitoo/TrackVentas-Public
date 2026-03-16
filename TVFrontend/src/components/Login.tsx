import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from "../api/axiosConfig";
import { jwtDecode } from "jwt-decode"; //TEST


interface LoginProps {
  onLogin: (usuario: any, token: string) => void;  // Recibe usuario y token
}
const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [Documento, setDocumento] = useState('');
  const [Clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!Documento || !Clave) {
    setError('Por favor, ingresa Documento y Clave.');
    return;
  }

  setError('');
  setLoading(true);

  try {
    const response = await api.post("/login/login", {
      Documento,
      Clave,
    });

    console.log("LOGIN RESPONSE:", response.data);

    const { success, token, rol, nombre } = response.data;

    if (!success) {
      setError("Documento o clave incorrectos.");
      setLoading(false);
      return;
    }

    // Decodificar token para obtener IdUsuario y otros datos //TEST
    const decoded: any = jwtDecode(token);

    // Guardar datos en localStorage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("rol", rol.toString());
    localStorage.setItem("nombre", nombre);
    localStorage.setItem("IdUsuario", decoded.IdUsuario);//TEST

     // Llamar onLogin con los datos necesarios
    /*const usuario = { nombre, rol }; // podés agregar más si querés
    onLogin(usuario, token); // ✅ ahora sí le pasamos los 2 argumentos

    setLoading(false);*/

    // Pasarlo al estado global TEST
    const usuario = {
    IdUsuario: decoded.IdUsuario,
    nombre: decoded.NombreCompleto,
    rol: decoded.IdRol,
    correo: decoded.Correo,
    };

onLogin(usuario, token);


    navigate("/home"); // redirige al home

  } catch (err: any) {
    console.error("Error login:", err);
    setError("No se pudo conectar con el servidor.");
    setLoading(false);
  }
};







  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/imagenes/logo.jpg" alt="Logo" className="logo-login" />
        <h1>TrackVentas</h1>
      </div>
      <div className='login-right'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="documento">Documento:</label>
          <input
            type="text"
            id="documento"
            value={Documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="clave">Clave:</label>
          <input
            type="password"
            id="password"
            value={Clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Iniciar Sesión</button>
      </form>
      
    </div>
    </div>
  );
};

export default Login;