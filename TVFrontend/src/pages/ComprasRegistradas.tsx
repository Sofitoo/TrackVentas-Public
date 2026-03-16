import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Compra {
  IdCompra: number;
  NumeroDocumento: string;
  MontoTotal: number;
  FechaRegistro: string;
  Proveedor: string;
  Usuario: string;
}

interface ProductoCompra {
  Codigo: string;
  Nombre: string;
  Cantidad: number;
  PrecioCompra: number;
  PrecioVenta: number;
}

interface CabeceraCompra {
  IdCompra: number;
  Proveedor: string;
  DocumentoProveedor: string;
  Usuario: string;
  FechaRegistro: string;
  MontoTotal: number;
}

const ComprasRegistradas: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await api.get("/api/compras");
        setCompras(res.data);
      } catch (error) {
        console.error("Error al obtener compras:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  const descargarPDFCompra = async (id: number) => {
    try {
      const res = await api.get(`/api/compras/${id}`);
      const { cabecera, productos }: { cabecera: CabeceraCompra; productos: ProductoCompra[] } = res.data;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Registro de Compra", 14, 22);

      doc.setFontSize(12);
      doc.text(`Proveedor: ${cabecera.Proveedor}`, 14, 32);
      doc.text(`Documento: ${cabecera.DocumentoProveedor}`, 14, 38);
      doc.text(`Usuario: ${cabecera.Usuario}`, 14, 44);
      doc.text(`Fecha: ${new Date(cabecera.FechaRegistro).toLocaleString()}`, 14, 50);

      const tableColumn = ["Código", "Producto", "Cantidad", "Precio Compra", "Precio Venta", "Subtotal"];
      const tableRows = productos.map(p => [
        p.Codigo,
        p.Nombre,
        p.Cantidad,
        `$${p.PrecioCompra}`,
        `$${p.PrecioVenta}`,
        `$${p.Cantidad * p.PrecioCompra}`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: "grid",
        headStyles: { fillColor: [22, 223, 187], textColor: 0 }, // verde pastel + texto negro
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 70;
      doc.text(`Total: $${cabecera.MontoTotal}`, 14, finalY + 10);

      doc.save(`compra_${cabecera.IdCompra}.pdf`);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al generar el PDF");
    }
  };

  if (loading) return <p>Cargando compras...</p>;

  return (
    <div className="compras-registradas-container">
      <h1 className="text-2xl font-bold">Compras Registradas</h1>

      <table className="tabla-compras">
        <thead>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Proveedor</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {compras.length > 0 ? (
            compras.map((c: Compra) => (
              <tr key={c.IdCompra}>
                <td>{c.IdCompra}</td>
                <td>{c.NumeroDocumento}</td>
                <td>{c.Proveedor}</td>
                <td>{c.Usuario}</td>
                <td>{new Date(c.FechaRegistro).toLocaleString()}</td>
                <td>${c.MontoTotal}</td>
                <td>
                  <button
                    className="btn-pdf"
                    onClick={() => descargarPDFCompra(c.IdCompra)}
                  >
                    Descargar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No hay compras registradas</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComprasRegistradas;
