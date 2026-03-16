// src/pages/Compras.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axiosConfig";

type CategoriaDTO = {
  Descripcion: string;
  IdCategoria: number;
  Estado: boolean;
  FechaRegistro: string;
};

type ProveedorDTO = {
  IdProveedor: number;
  Documento: string;
  RazonSocial: string;
};

type ProductoDTO = {
  IdCategoria: null;
  Estado: number;
  Descripcion: string;
  IdProducto: number;
  Codigo: string;
  Nombre: string;
  PrecioCompra: number;
  PrecioVenta: number;
  Stock: number;
};

type ProductoCompraPayload = {
  IdProducto?: number | null;
  IdCategoria?: number | null;
  Codigo: string;
  Nombre: string;
  Descripcion: string;  // Nuevo
  PrecioCompra: number;
  PrecioVenta: number;
  Cantidad: number;
  Total: number;
  Estado: number;  // 1 = Activo, 0 = Inactivo
};

const API_BASE = "http://localhost:5000"; // ajustar si tu backend usa otra URL

const Compras: React.FC = () => {
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [tipoDocumento, setTipoDocumento] = useState<string>("Registro");
  const [numeroDocumento, setNumeroDocumento] = useState("");

  const [proveedores, setProveedores] = useState<ProveedorDTO[]>([]);
  const [productos, setProductos] = useState<ProductoDTO[]>([]);

  // proveedor seleccionado por id (se sincroniza con ambos dropdowns)
  const [provDocumentoInput, setProvDocumentoInput] = useState<string>("");
  const [provRazonInput, setProvRazonInput] = useState<string>("");
  const [selectedProveedor, setSelectedProveedor] = useState<ProveedorDTO | null>(null);

  // producto inputs
  const [codigoInput, setCodigoInput] = useState<string>("");
  const [nombreInput, setNombreInput] = useState<string>("");
  const [precioCompraInput, setPrecioCompraInput] = useState<number>(0);
  const [precioVentaInput, setPrecioVentaInput] = useState<number>(0);
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [descripcionInput, setDescripcionInput] = useState<string>("");
  const [estadoInput, setEstadoInput] = useState<number>(1);  // Por defecto activo

  //categorias
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [categoriaInput, setCategoriaInput] = useState<number | null>(null);  // Para productos nuevos


  // lista de productos a comprar
  const [lista, setLista] = useState<ProductoCompraPayload[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // total
  const total = lista.reduce((acc, p) => acc + p.Total, 0);

  useEffect(() => {
    // carga inicial
    fetchProveedores();
    fetchProductos();
    fetchCategorias();
  }, []);

  

  const fetchCategorias = async () => {
  try {
    const res = await api.get("/categoria");
    console.log("Categorias recibidas:", res.data); // <-- AQUI
    setCategorias(res.data);
  } catch (err) {
    console.error("Error al traer categorías:", err);
  }
};


  const fetchProveedores = async () => {
  try {
    const res = await api.get(`/api/proveedores`);
    
    const mapped = res.data.map((p: any) => ({
      IdProveedor: p.IdProveedor,
      Documento: p.Documento,
      RazonSocial: p.RazonSocial
    }));

    setProveedores(mapped);
  } catch (err) {
    console.error("Error al traer proveedores:", err);
  }
};


  const fetchProductos = async () => {
    try {
      const res = await api.get<ProductoDTO[]>(`/api/products`);
      setProductos(res.data);
    } catch (err) {
      console.error("Error al traer productos:", err);
    }
  };

  // Si el usuario escribe el doc o la razón, sincronizamos selectedProveedor automáticamente
  // --- FIX PROVEEDOR ---
// Solo selecciona proveedor si coincide EXACTAMENTE con documento o razón social.
// NO pisa los inputs para evitar loops.
useEffect(() => {
  const prov = proveedores.find((p) => {
    const doc = p.Documento?.toLowerCase() ?? "";
    const razon = p.RazonSocial?.toLowerCase() ?? "";

    return (
      doc === provDocumentoInput.toLowerCase() ||
      razon === provRazonInput.toLowerCase()
    );
  });

  setSelectedProveedor(prov ?? null);

}, [provDocumentoInput, provRazonInput, proveedores]);



  // Si el usuario escribe el codigo o nombre, autocompleta campos con producto existente
  useEffect(() => {
    const prod = productos.find((p) => p.Codigo === codigoInput || p.Nombre === nombreInput);
    if (prod) {
      setCodigoInput(prod.Codigo);
      setNombreInput(prod.Nombre);
      setPrecioCompraInput(prod.PrecioCompra ?? 0);
      setPrecioVentaInput(prod.PrecioVenta ?? 0);
      setCantidadInput(1);
      setCategoriaInput(prod.IdCategoria ?? null);
      setDescripcionInput(prod.Descripcion || "");
    }
  }, [codigoInput, nombreInput, productos]);

  const agregarProducto = () => {
  if (!nombreInput || precioCompraInput <= 0 || cantidadInput <= 0) {
    alert("Completa nombre, precio de compra y cantidad válidos.");
    return;
  }
  const subtotal = Number(precioCompraInput) * Number(cantidadInput);
  const payload: ProductoCompraPayload = {
    IdProducto: undefined, // se llenará si coincide con producto existente
    IdCategoria: categoriaInput == null ? null : categoriaInput, //-----------------------------------------------------------ARREGLAR
    Codigo: codigoInput,
    Nombre: nombreInput,
    Descripcion: descripcionInput,  // Nuevo
    PrecioCompra: Number(precioCompraInput),
    PrecioVenta: Number(precioVentaInput),
    Cantidad: Number(cantidadInput),
    Total: Number(subtotal),
    Estado: estadoInput,  // Nuevo
  };

    // si existe producto en DB, pondremos su id
    const exist = productos.find((p) => p.Codigo === codigoInput || p.Nombre === nombreInput);
  if (exist) {
    // Ver si el usuario realmente modificó los precios
    const preciosEditados =
      exist.PrecioCompra !== Number(precioCompraInput) ||
      exist.PrecioVenta !== Number(precioVentaInput);

  // Mostrar alerta solo si se editaron precios
  if (preciosEditados) {
    // 🟧 Mostrar alerta antes de pisar los precios
    const confirmar = window.confirm(
      `⚠️ El producto ya existe:\n\n` +
      `• Código: ${exist.Codigo}\n` +
      `• Nombre: ${exist.Nombre}\n\n` +
      `Precios actuales:\n` +
      `- Compra: $${exist.PrecioCompra}\n` +
      `- Venta:  $${exist.PrecioVenta}\n\n` +
      `¿Querés reemplazar estos precios por los nuevos?\n`
    );

    if (!confirmar) {
      // si NO quiere pisarlos → usar los precios viejos
      payload.PrecioCompra = exist.PrecioCompra;
      payload.PrecioVenta = exist.PrecioVenta;
    }
  }

    // SI existe, SIEMPRE uso datos fijos como Id, código, nombre, etc.
    payload.IdProducto = exist.IdProducto;
    payload.Codigo = exist.Codigo;
    payload.Nombre = exist.Nombre;
    payload.Descripcion = exist.Descripcion || "";
    payload.Estado = exist.Estado || 1;
    payload.IdCategoria = exist.IdCategoria ?? null;
  }

  if (editingIndex !== null) {
    // modo editar
    setLista((prev) =>
      prev.map((item, idx) => (idx === editingIndex ? payload : item))
    );
    setEditingIndex(null);
  } else {
    // modo agregar normal
    setLista((prev) => [...prev, payload]);
  }
  
  // Limpiar, incluyendo los nuevos campos
  setCodigoInput("");
  setNombreInput("");
  setDescripcionInput("");  // Nuevo
  setPrecioCompraInput(0);
  setPrecioVentaInput(0);
  setEstadoInput(1);  // Reset a activo
  setCantidadInput(1);
  setCategoriaInput(null);
  };

  //LIMPIAR CAMPOS
  const limpiarProducto = () => {
  //setProductoInput(null);
  setCodigoInput("");
  setNombreInput("");
  setDescripcionInput("");
  setPrecioCompraInput(0);
  setPrecioVentaInput(0);
  setCategoriaInput(null);
  setCantidadInput(0);
};


  //editar 
  const editar = (i: number) => {
  const p = lista[i];
  setCodigoInput(p.Codigo);
  setNombreInput(p.Nombre);
  setDescripcionInput(p.Descripcion);  // Nuevo
  setPrecioCompraInput(p.PrecioCompra);
  setPrecioVentaInput(p.PrecioVenta);
  setEstadoInput(p.Estado);  // Nuevo
  setCantidadInput(p.Cantidad);
  setCategoriaInput(p.IdCategoria || null);  
  setEditingIndex(i);
  };

  const eliminar = (i: number) => {
    setLista((s) => s.filter((_, idx) => idx !== i));
  };

  const handleRealizarCompra = async () => {
    console.log(">>> ENTRÉ A GUARDAR COMPRA <<<");
    if (!selectedProveedor) {
      alert("Seleccioná un proveedor válido (documento o razón social).");
      return;
    }
    if (lista.length === 0) {
      alert("Agregá al menos un producto.");
      return;
    }

    const usuarioId = Number(localStorage.getItem("IdUsuario")) || null; //TEST

    const payload = {
      Fecha: fecha,
      TipoDocumento: tipoDocumento,
      IdUsuario: usuarioId,
      IdProveedor: selectedProveedor.IdProveedor,
      NumeroDocumento: numeroDocumento, // se puede usar un input si quiere el usuario
      Total: total,
      Detalle: lista.map((p) => ({
        IdProducto: p.IdProducto ?? null,
        PrecioCompra: p.PrecioCompra,
        PrecioVenta: p.PrecioVenta,
        Cantidad: p.Cantidad,
        Total: p.Total,
      })),
    };

    try {
      const res = await api.post(`${API_BASE}/compras/registrar`, payload);
      alert("Compra registrada ✅" + JSON.stringify(res.data, null, 2));
      // limpiar
      setLista([]);
      setProvDocumentoInput("");
      setProvRazonInput("");
      setSelectedProveedor(null);
    } catch (err: any) {
      console.error("Error al registrar compra:", err);
      alert("Error al registrar compra: " + (err.response?.data?.message ?? err.message));
    }
  };

  return (
    <div className="compra-page">
      <h1 className="text-2xl font-bold">Registrar Compra</h1>

      <section className="card">
        <h3>Información de la Compra</h3>
        <div className="row">
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div className="row">
          <label>Tipo Documento</label>
          <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
            <option>Registro</option>
          </select>
        </div>

        <div className="row">
  <label>Número de Documento</label>
  <input
    type="text"
    value={numeroDocumento}
    onChange={(e) => setNumeroDocumento(e.target.value)}
    placeholder="Ej: CODIGO123"
  />
</div>

      </section>

      <section className="card">
        <h3>Proveedor</h3>
        <div className="row">
          <label>Documento</label>
          <input
            list="provDocList"
            value={provDocumentoInput}
            onChange={(e) => setProvDocumentoInput(e.target.value)}
            placeholder="Buscar por documento..."
          />
          <datalist id="provDocList">
            {proveedores.map((p) => (
              <option key={p.IdProveedor + "-doc"} value={p.Documento}>
  {p.RazonSocial}
</option>
            ))}
          </datalist>
        </div>

        <div className="row">
          <label>Razón social</label>
          <input
            list="provRazonList"
            value={provRazonInput}
            onChange={(e) => setProvRazonInput(e.target.value)}
            placeholder="Buscar por razón social..."
          />
          <datalist id="provRazonList">
            {proveedores.map((p) => (
              <option key={p.IdProveedor + "-razon"} value={p.RazonSocial}>
  {p.RazonSocial}
</option>
            ))}
          </datalist>
        </div>

        <div className="selected-box">
          <strong>Proveedor seleccionado:</strong>
          <div>{selectedProveedor ? `${selectedProveedor.RazonSocial} — ${selectedProveedor.Documento}` : "Ninguno"}</div>
        </div>
      </section>

      <section className="card">
        <h3>Producto</h3>
        <div className="grid-4">
          <div>
            <label>Código</label>
            <input list="prodCodigo" value={codigoInput} onChange={(e) => setCodigoInput(e.target.value)} />
            <datalist id="prodCodigo">
              {productos.map((p) => (
                <option key={p.IdProducto + "-codigo"} value={p.Codigo}>
                {p.Nombre}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label>Producto</label>
            <input list="prodNombre" value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} />
            <datalist id="prodNombre">
              {productos.map((p) => (
                <option key={p.IdProducto + "-nombre"} value={p.Nombre}>
                 {p.Nombre}
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label>Categoría</label>
            <select
            value={categoriaInput === null ? "" : categoriaInput}
            onChange={(e) =>
              setCategoriaInput(e.target.value === "" ? null : Number(e.target.value))
            }
            >
               <option value="">Seleccionar categoría</option>

               {categorias.map((cat) => (
               <option key={cat.IdCategoria} value={cat.IdCategoria}>
               {cat.Descripcion}
               </option>
               ))}
         </select>

</div>

          <div>
            <label>Precio compra</label>
            <input type="number" value={precioCompraInput} onChange={(e) => setPrecioCompraInput(Number(e.target.value))} />
          </div>

          <div>
            <label>Precio venta</label>
            <input type="number" value={precioVentaInput} onChange={(e) => setPrecioVentaInput(Number(e.target.value))} />
          </div>

          <div>
      <label>Descripción</label>
      <input 
        type="text" 
        value={descripcionInput} 
        onChange={(e) => setDescripcionInput(e.target.value)} 
        placeholder="Descripción del producto" 
      />
    </div>
    <div>
      <label>Estado</label>
      <select value={estadoInput} onChange={(e) => setEstadoInput(Number(e.target.value))}>
        <option value={1}>Activo</option>
        <option value={0}>Inactivo</option>
      </select>
    </div>

          <div>
            <label>Cantidad</label>
            <input type="number" value={cantidadInput} onChange={(e) => setCantidadInput(Number(e.target.value))} />
          </div>

          <div style={{ alignSelf: "end" }}>
            <button onClick={agregarProducto}>{editingIndex !== null ? "Actualizar" : "Agregar"}</button>
            {codigoInput && (
            <button
              type="button"
              onClick={limpiarProducto}
              className="bg-gray-500 text-white px-4 py-2 rounded"
              >
              Cancelar
              </button>
              )}
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Productos agregados</h3>
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Descripcion</th>
              <th>Estado</th>
              <th>Precio compra</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={i}>
                <td>{p.Codigo}</td>
                <td>{p.Nombre}</td>
                <td>{categorias.find(c => c.IdCategoria === p.IdCategoria)?.Descripcion || "N/A"}</td>
                <td>{p.Descripcion}</td>
                <td>{p.Estado === 1 ? "Activo" : "Inactivo"}</td>
                <td>${p.PrecioCompra.toFixed(2)}</td>
                <td>{p.Cantidad}</td>
                <td>${p.Total.toFixed(2)}</td>
                <td>
                  <button onClick={() => editar(i)}>Editar</button>
                  <button onClick={() => eliminar(i)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 12 }}>
                  No hay productos agregados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="footer">
        <div className="total-card">
          <div>Total a pagar</div>
          <div className="total-amount">${total.toFixed(2)}</div>
        </div>

        <div>
          <button className="btn-primary" onClick={handleRealizarCompra}>
            Realizar compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compras;
