import dotenv from 'dotenv';  // Import correcto de dotenv
dotenv.config();  // Carga las variables de .env (ej. PORT=5000)
export default {
  port: process.env.PORT || 5000,  // Lee de .env, fallback a 5000
};