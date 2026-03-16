import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("authMiddleware - Authorization:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token faltante o mal formado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // acá trae IdRol, IdUsuario, etc.
    next();
  } catch (err) {
    console.error("JWT ERROR:", err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};




/*import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//CON TOKEN SIMULADO:
// Middleware sencillo: valida que llegue un token "mi-token-simulado" en formato Bearer
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("authMiddleware - Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token faltante o mal formado" });
    }

    const token = authHeader.split(" ")[1];

    if (token !== "mi-token-simulado") {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Por ahora simulamos un usuario admin (después metemos bien el rol)
    req.user = {
      IdUsuario: 1,
      IdRol: 1,
      NombreCompleto: "Admin Simulado",
      Correo: "admin@simulado.com"
    };

    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};*/





//CON TOKEN REAL
/*export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token faltante" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Asegurate que el payload incluya RolId y cualquier dato que necesites
    req.user = {
      IdUsuario: decoded.IdUsuario,
      RolId: decoded.RolId,
      NombreCompleto: decoded.NombreCompleto,
      Correo: decoded.Correo
    };

    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};*/
