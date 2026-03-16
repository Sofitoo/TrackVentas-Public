// src/pages/Ventas.tsx
import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:5000";

interface ClienteDTO {
  IdCliente: number;
  NombreCompleto: string;
  Documento: string;
  Correo: string;
  Telefono: string;
}

interface ProductoDTO {
  IdProducto: number;
  Nombre: string;
  PrecioVenta: number;
  Stock: number;
}

interface ProductoSeleccionado {
  IdProducto: number;
  Nombre: string;
  PrecioVenta: number;
  Cantidad: number;
  Stock: number;
}

interface VentaDTO {
  IdVenta: number;
  NombreCliente: string;
  TipoDocumento: string;
  FechaRegistro: string;
  MontoTotal: number;
  Productos: ProductoSeleccionado[];
}

const Ventas: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [ventas, setVentas] = useState<VentaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [idCliente, setIdCliente] = useState<number | "">("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [documentoCliente, setDocumentoCliente] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState("Registro");
  const [montoPago, setMontoPago] = useState<number>(0);

  const totalVenta = productosSeleccionados.reduce(
    (acc, p) => acc + p.PrecioVenta * p.Cantidad,
    0
  );

  const vuelto = montoPago > totalVenta ? montoPago - totalVenta : 0;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resClientes, resProductos, resVentas] = await Promise.all([
        api.get(`${API_BASE}/api/clientes`),
        api.get(`${API_BASE}/api/products`),
        api.get(`${API_BASE}/api/ventas`),
      ]);

      setClientes(resClientes.data);
      setProductos(resProductos.data);
      setVentas(resVentas.data);
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = (id: number) => {
    const producto = productos.find((p) => p.IdProducto === id);
    if (!producto) return;

    const yaExiste = productosSeleccionados.find((p) => p.IdProducto === producto.IdProducto);
    if (yaExiste) return;

    const nuevoProducto: ProductoSeleccionado = {
      IdProducto: producto.IdProducto,
      Nombre: producto.Nombre,
      PrecioVenta: producto.PrecioVenta,
      Stock: producto.Stock,
      Cantidad: 1,
    };

    setProductosSeleccionados((prev) => [...prev, nuevoProducto]);
  };

  const cambiarCantidad = (id: number, cant: number) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p.IdProducto === id ? { ...p, Cantidad: cant <= p.Stock ? cant : p.Stock } : p
      )
    );
  };

  const quitarProducto = (id: number) => {
    setProductosSeleccionados((prev) => prev.filter((p) => p.IdProducto !== id));
  };

  const rellenarClienteUnknown = () => {
    setIdCliente(-1);
    setNombreCliente("Unknown");
    setDocumentoCliente("Unknown");
  };

  const registrarVenta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCliente) return alert("Seleccione un cliente o use 'Cliente Desconocido'");
    if (productosSeleccionados.length === 0) return alert("Seleccione al menos un producto");
    if (totalVenta <= 0) return alert("La venta no puede ser 0");
    if (montoPago < totalVenta) return alert("El pago es insuficiente (falta dinero)");

    let cliente;
    if (idCliente !== -1) {
      cliente = clientes.find((c) => c.IdCliente === Number(idCliente));
      if (!cliente) return alert("Cliente no encontrado");
    }

    const payload = {
      IdUsuario: 1,
      TipoDocumento: tipoDocumento,
      DocumentoCliente: idCliente === -1 ? "Unknown" : cliente!.Documento,
      NombreCliente: idCliente === -1 ? "Unknown" : cliente!.NombreCompleto,
      Productos: productosSeleccionados.map((p) => ({
        IdProducto: p.IdProducto,
        Cantidad: p.Cantidad,
      })),
      MontoPago: montoPago,
    };

    try {
      await api.post(`${API_BASE}/api/ventas/registrar`, payload);
      alert("Venta registrada con éxito");

      // limpiar form
      setIdCliente("");
      setNombreCliente("");
      setDocumentoCliente("");
      setProductosSeleccionados([]);
      setMontoPago(0);

      cargarDatos();
    } catch (e: any) {
      console.error("Error al registrar venta:", e);
      alert("Error al registrar venta");
    }
  };

  const descargarPDF = (venta: VentaDTO, productos: ProductoSeleccionado[]) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Registro de Venta", 14, 22);

    doc.setFontSize(12);
    doc.text(`Cliente: ${venta.NombreCliente}`, 14, 32);
    doc.text(`Tipo Documento: ${venta.TipoDocumento}`, 14, 38);
    doc.text(`Fecha: ${new Date(venta.FechaRegistro).toLocaleString()}`, 14, 44);

    const tableColumn = ["Producto", "Cantidad", "Precio Unitario", "Subtotal"];
    const tableRows: any[] = [];

    productos.forEach((p) => {
      const subtotal = p.Cantidad * p.PrecioVenta;
      tableRows.push([p.Nombre, p.Cantidad, `$${p.PrecioVenta}`, `$${subtotal}`]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "grid",
      headStyles: { fillColor: [22, 223, 187], textColor: 0 }, 
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 60;
    doc.text(`Total: $${venta.MontoTotal}`, 14, finalY + 10);

    doc.save(`venta_${venta.IdVenta}.pdf`);
  };

  const handleDescargar = async (venta: VentaDTO) => {
    try {
      const res = await api.get(`${API_BASE}/api/ventas/${venta.IdVenta}/productos`);
      const productos = res.data.map((p: any) => ({
      IdProducto: p.IdProducto,
      Nombre: p.Producto, // <--- asegurarte que exista
      PrecioVenta: p.PrecioVenta,
      Cantidad: p.Cantidad,
      Stock: p.Stock ?? 0,
    })) as ProductoSeleccionado[];
    descargarPDF(venta, productos);
  } catch (e) {
    alert("Error al descargar el PDF");
  }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-5 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Registrar Venta</h1>

      {/* FORM */}
      <div className="bg-white shadow-md p-5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Información de la Venta</h3>

        <form className="flex flex-col gap-4" onSubmit={registrarVenta}>
          {/* Cliente */}
          <div className="flex flex-col">
            <label className="font-semibold">Cliente</label>
            <select
              value={idCliente}
              onChange={(e) => setIdCliente(Number(e.target.value))}
              className="border p-2 rounded-lg"
            >
              <option value="">Seleccionar Cliente</option>
              {clientes.map((c) => (
                <option key={c.IdCliente} value={c.IdCliente}>
                  {c.NombreCompleto} - {c.Documento}
                </option>
              ))}
              <option value={-1}>Unknown</option>
            </select>
            <button
              type="button"
              onClick={rellenarClienteUnknown}
              className="bg-gray-500 text-white px-3 rounded-lg mt-2"
            >
              Cliente Desconocido
            </button>
          </div>

          {/* Productos */}
          <div>
            <label className="font-semibold">Productos (con stock)</label>
            <select
              className="border p-2 rounded-lg w-full mt-1"
              value=""
              onChange={(e) => agregarProducto(Number(e.target.value))}
            >
              <option value="">Seleccionar producto</option>
              {productos.map((p) => (
                <option key={p.IdProducto} value={p.IdProducto}>
                  {p.Nombre} — ${p.PrecioVenta} — Stock: {p.Stock}
                </option>
              ))}
            </select>

            <div className="mt-3 flex flex-col gap-2">
              {productosSeleccionados.map((p) => (
                <div
                  key={p.IdProducto}
                  className="border p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{p.Nombre} — ${p.PrecioVenta}</p>
                    <p className="text-sm text-gray-500">Stock disponible: {p.Stock}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={p.Stock}
                      value={p.Cantidad}
                      onChange={(e) => cambiarCantidad(p.IdProducto, Number(e.target.value))}
                      className="border p-1 rounded-lg w-20"
                    />
                    <button
                      type="button"
                      onClick={() => quitarProducto(p.IdProducto)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="font-semibold">Tipo Documento</label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="border p-2 rounded-lg w-full"
            >
              <option value="Registro">Registro</option>
            </select>
          </div>

          {/* Pago */}
          <div>
            <label className="font-semibold">Monto Pago</label>
            <input
              type="number"
              value={montoPago}
              onChange={(e) => setMontoPago(Number(e.target.value))}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          {/* Totales */}
          <div className="bg-gray-100 p-3 rounded-xl">
            <p className="font-semibold">Total: ${totalVenta}</p>
            <p className="font-semibold text-green-700">Vuelto: ${vuelto}</p>
          </div>

          <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg">
            Registrar Venta
          </button>
        </form>
      </div>

      {/* LISTA DE VENTAS */}
      <div className="bg-white shadow-md p-5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Ventas Registradas</h3>

        <table className="w-full border mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Documento</th>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">PDF</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.IdVenta}>
                <td className="p-2 border">{v.IdVenta}</td>
                <td className="p-2 border">{v.NombreCliente}</td>
                <td className="p-2 border">{v.TipoDocumento}</td>
                <td className="p-2 border">{new Date(v.FechaRegistro).toLocaleString()}</td>
                <td className="p-2 border">${v.MontoTotal}</td>
                <td className="p-2 border">
                  <button onClick={() => handleDescargar(v)} className="bg-green-600 text-white px-3 py-1 rounded-lg">
                    Descargar PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ventas;
