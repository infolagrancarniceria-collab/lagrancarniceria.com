"use client";

import { useState, type FormEvent } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import { useCart } from "@/lib/cart";
import { formatoCLP } from "@/lib/format";
import { totalCarrito } from "@/lib/pricing";
import { useUi } from "@/lib/ui";
import { construirMensajePedido, linkWhatsapp } from "@/lib/whatsapp";
import type { MedioPago, TipoEntrega } from "@/lib/types";

export default function ConfirmarDrawer() {
  const { confirmarAbierto, cerrarConfirmar, abrirCarrito } = useUi();
  const { comunas } = useCatalogoData();
  const { items, vaciar } = useCart();

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("despacho");
  const [comunaNombre, setComunaNombre] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [medioPago, setMedioPago] = useState<MedioPago | "">("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirmarAbierto) return null;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (tipoEntrega === "despacho" && (!comunaNombre || !clienteDireccion.trim())) {
      setError("Falta la comuna o la dirección para el despacho");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre,
          clienteTelefono,
          tipoEntrega,
          clienteDireccion: tipoEntrega === "despacho" ? clienteDireccion.trim() : null,
          comunaNombre: tipoEntrega === "despacho" ? comunaNombre : null,
          fechaEntrega: fechaEntrega.trim() || null,
          medioPago: medioPago || null,
          items: items.map((i) => ({
            plu: i.plu,
            descripcion: i.descripcion,
            corte: i.corte,
            envasado: i.envasado,
            instrucciones: i.instrucciones,
            cantidad: i.cantidad,
            unidad: i.unidad,
            precioUnitario: i.precio,
          })),
          comentario: comentario.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos registrar el pedido");

      const mensaje = construirMensajePedido(items, {
        clienteNombre,
        clienteTelefono,
        tipoEntrega,
        comunaNombre: tipoEntrega === "despacho" ? comunaNombre : null,
        clienteDireccion: tipoEntrega === "despacho" ? clienteDireccion.trim() : null,
        costoEnvio: tipoEntrega === "despacho" ? data.costoEnvio : null,
        fechaEntrega: fechaEntrega.trim() || null,
        medioPago: medioPago || null,
        comentario: comentario.trim(),
      });
      window.open(linkWhatsapp(mensaje), "_blank");

      vaciar();
      cerrarConfirmar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos registrar el pedido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={cerrarConfirmar}>
      <form
        onSubmit={enviar}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6"
        style={{ boxShadow: "0 -8px 30px rgba(0,0,0,.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-dark">Confirmar pedido</h3>
          <button
            type="button"
            onClick={() => {
              cerrarConfirmar();
              abrirCarrito();
            }}
            className="text-sm text-muted hover:text-dark"
          >
            Volver
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
            Nombre
            <input
              required
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
            Teléfono
            <input
              required
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-dark">Tipo de entrega</p>
            <div className="mt-2 flex gap-2">
              {(["despacho", "retiro"] as TipoEntrega[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipoEntrega(t)}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300"
                  style={
                    tipoEntrega === t
                      ? { background: "var(--accent)", color: "var(--background)" }
                      : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--card-border)" }
                  }
                >
                  {t === "despacho" ? "Despacho a domicilio" : "Retiro en tienda"}
                </button>
              ))}
            </div>
          </div>

          {tipoEntrega === "despacho" && (
            <>
              <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
                Comuna
                <select
                  required
                  value={comunaNombre}
                  onChange={(e) => setComunaNombre(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
                  style={{ border: "1px solid var(--card-border)" }}
                >
                  <option value="">Selecciona tu comuna</option>
                  {comunas.map((c) => (
                    <option key={c.nombre} value={c.nombre}>
                      {c.nombre} — {c.costoEnvio === 0 ? "Gratis" : formatoCLP(c.costoEnvio)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
                Dirección
                <input
                  required
                  value={clienteDireccion}
                  onChange={(e) => setClienteDireccion(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
                  style={{ border: "1px solid var(--card-border)" }}
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
            Fecha de entrega
            <input
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              placeholder="Ej: hoy, mañana, viernes 28"
              className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            />
            <span className="text-xs font-normal text-muted">
              Solo tomamos los primeros 5 pedidos del día para despachar ese mismo día, y hasta las 15:00 — después
              de esa hora (o pasado ese cupo) el pedido queda agendado para el día siguiente. Te confirmamos por
              WhatsApp si tu pedido queda para hoy o no.
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
            Medio de pago
            <select
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value as MedioPago | "")}
              className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            >
              <option value="">Prefiero decirlo por WhatsApp</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta débito/crédito">Tarjeta débito/crédito</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-dark">
            Observaciones (opcional)
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, 500))}
              rows={2}
              className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm font-semibold" style={{ color: "var(--offer)" }}>{error}</p>}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-dark">Total</span>
          <span className="tabular font-sans text-2xl font-bold text-accent">{formatoCLP(totalCarrito(items))}</span>
        </div>

        <button
          type="submit"
          disabled={enviando || items.length === 0}
          className="mt-4 w-full rounded-lg py-3 text-sm font-semibold transition-colors duration-300 disabled:opacity-60"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          {enviando ? "Enviando…" : "Enviar por WhatsApp"}
        </button>
      </form>
    </div>
  );
}
