// detallenegocio.controllers.js

let detalleNegocio = {
  cuit: "",
  direccion: "",
  telefono: "",
};

export const obtenerDetalleNegocio = (req, res) => {
   console.log("GET /detallenegocio ejecutado");
  res.json(detalleNegocio);
};

export const guardarDetalleNegocio = (req, res) => {
  console.log("PUT /detallenegocio BODY:", req.body);
  const { cuit, direccion, telefono } = req.body;

  if (cuit) detalleNegocio.cuit = cuit;
  if (direccion) detalleNegocio.direccion = direccion;
  if (telefono) detalleNegocio.telefono = telefono;

  console.log("Nuevo detalle de negocio:", detalleNegocio);

  res.json({ message: "Detalle actualizado", detalle: detalleNegocio });
};

export { detalleNegocio };
