"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { formatoCLP } from "@/lib/format";

interface Comuna {
  nombre: string;
  costoEnvio: number;
}

const WHATSAPP_NUMERO = "56991508931";

export default function Carrito({ comunas }: { comunas: Comuna[] }) {
  const { items, actualizarCantidad, quitar, vaciar } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [comunaNombre, setComunaNombre] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comuna = comunas.find((c) => c.nombre === comunaNombre);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items]
  );

  async function confirmarPedido(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Tu carrito está vacío");
      return;
    }
    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !comunaNombre) {
      setError("Completa nombre, teléfono, dirección y comuna");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre: nombre.trim(),
          clienteTelefono: telefono.trim(),
          clienteDireccion: direccion.trim(),
          comunaNombre,
          comentario: comentario.trim() || undefined,
          items: items.map((i) => ({
            descripcion: i.descripcion,
            corte: i.corte,
            cantidad: i.cantidad,
            unidad: i.unidad,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el pedido");
        setEnviando(false);
        return;
      }

      const lineas = items.map(
        (i) =>
          `• ${i.descripcion}${i.corte ? ` (${i.corte})` : ""} — ${i.cantidad} ${i.unidad === "kg" ? "kg" : "un."}`
      );
      const mensaje = [
        `Hola! Quiero hacer este pedido para despacho:`,
        ``,
        ...lineas,
        ``,
        `Envío a ${comunaNombre} (${formatoCLP(data.costoEnvio)})`,
        `Nombre: ${nombre.trim()}`,
        `Dirección: ${direccion.trim()}`,
        comentario.trim() ? `Comentario: ${comentario.trim()}` : null,
        ``,
        `(Precio referencial: ${formatoCLP(subtotal + data.costoEnvio)} — puede variar según el peso exacto)`,
      ]
        .filter(Boolean)
        .join("\n");

      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`, "_blank");
      vaciar();
    } catch {
      setError("No se pudo enviar el pedido — revisa tu conexión e intenta de nuevo");
    } finally {
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-lg border border-surface-border bg-surface p-6 text-muted">
        Tu carrito está vacío.{" "}
        <Link href="/precios" className="text-accent hover:underline">
          Ver precios
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <section>
        <ul className="divide-y divide-surface-border rounded-lg border border-surface-border bg-surface">
          {items.map((i) => (
            <li key={`${i.idPos}-${i.corte ?? "sin-corte"}`} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">
                  {i.descripcion}
                  {i.corte && <span className="text-muted"> — {i.corte}</span>}
                </p>
                <p className="text-sm text-muted">
                  {formatoCLP(i.precio)}/{i.unidad === "kg" ? "kg" : "un."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step={i.unidad === "kg" ? "0.5" : "1"}
                  value={i.cantidad}
                  onChange={(e) => actualizarCantidad(i.idPos, i.corte, Number(e.target.value))}
                  className="w-16 rounded-md border border-surface-border bg-background px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => quitar(i.idPos, i.corte)}
                  className="text-danger hover:underline"
                  aria-label={`Quitar ${i.descripcion}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Subtotal aprox.: <span className="font-medium text-foreground">{formatoCLP(subtotal)}</span> — el envío se
          suma según tu comuna.
        </p>
      </section>

      <section>
        <form onSubmit={confirmarPedido} className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Datos de despacho</h2>
          {error && <p className="text-sm text-danger">{error}</p>}
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rounded-md border border-surface-border bg-background px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Teléfono
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="rounded-md border border-surface-border bg-background px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Dirección
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="rounded-md border border-surface-border bg-background px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Comuna
            <select
              value={comunaNombre}
              onChange={(e) => setComunaNombre(e.target.value)}
              className="rounded-md border border-surface-border bg-background px-3 py-2"
              required
            >
              <option value="">Elige tu comuna</option>
              {comunas.map((c) => (
                <option key={c.nombre} value={c.nombre}>
                  {c.nombre} — {c.costoEnvio === 0 ? "Gratis" : formatoCLP(c.costoEnvio)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Comentario (opcional)
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="rounded-md border border-surface-border bg-background px-3 py-2"
              rows={2}
            />
          </label>

          {comuna && (
            <p className="text-sm text-muted">
              Total aprox. con envío:{" "}
              <span className="font-medium text-foreground">{formatoCLP(subtotal + comuna.costoEnvio)}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-accent px-6 py-3 font-medium text-background hover:bg-accent-strong disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Confirmar y enviar por WhatsApp"}
          </button>
          <p className="text-xs text-muted">
            Al confirmar se abre WhatsApp con tu pedido para coordinar el despacho. Los precios son referenciales y
            pueden variar levemente según el peso exacto.
          </p>
        </form>
      </section>
    </div>
  );
}
