export const roleAuth = (rolesPermitidos) => {
  return (req, res, next) => {

    const IdRol = req.user?.IdRol; // debe venir del token o sesión

    if (!IdRol) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!rolesPermitidos.includes(IdRol)) {
      return res.status(403).json({ message: "No tienes permisos para acceder a esta sección" });
    }

    next();
  };
};
