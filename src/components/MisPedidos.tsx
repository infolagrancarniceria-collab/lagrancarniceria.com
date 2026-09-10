"use client";

import { useState, type FormEvent } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import { useCart } from "@/lib/cart";
import { useUi } from "@/lib/ui";
import { formatoCLP, formatoPeso } from "@/lib/format";
import type { PedidoHistorial } from "@/lib/types";

function totalPedido(p: PedidoHistorial): number {
  const totalItems = p.items.reduce(
    (acc, i) => acc + (i.unidad === "kg" ? Math.round((i.precioUnitario * i.cantidad) / 1000) : i.precioUnitario * i.cantidad),
    0
  );
  return totalItems + (p.costoEnvio ?? 0);
}

function cantidadPedido(cantidad: number, unidad: "kg" | "unidad"): string {
  return unidad === "kg" ? formatoPeso(cantidad) : `${cantidad} un.`;
}

// Historial de pedidos por teléfono, sin cuenta ni clave — a pedido del
// usuario (ver diagnóstico de ventas online): resuelve "¿me repiten lo que
// pedí la vez pasada?" y "pedir de nuevo más rápido" sin construir un
// sistema de login completo, algo que no se justifica con el volumen de
// pedidos web actual.
export default function MisPedidos() {
  const { productos } = useCatalogoData();
  const { agregar } = useCart();
  const { abrirCarrito } = useUi();

  const [telefono, setTelefono] = useState("");
  const [pedidos, setPedidos] = useState<PedidoHistorial[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function buscar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setBuscando(true);
    try {
      const res = await fetch(`/api/pedidos?telefono=${encodeURIComponent(telefono.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos buscar tus pedidos");
      setPedidos(data);
    } catch (err) {
      setPedidos(null);
      setError(err instanceof Error ? err.message : "No pudimos buscar tus pedidos");
    } finally {
      setBuscando(false);
    }
  }

  function pedirDeNuevo(p: PedidoHistorial) {
    let algunoOmitido = false;
    for (const item of p.items) {
      const actual = productos.find((prod) => prod.plu === item.plu);
      if (!actual || actual.disponibilidad !== "disponible") {
        algunoOmitido = true;
        continue;
      }
      agregar(
        {
          idPos: actual.idPos,
          plu: actual.plu,
          descripcion: actual.descripcion,
          corte: item.corte,
          envasado: item.envasado,
          instrucciones: item.instrucciones,
          precio: actual.precio,
          unidad: actual.unidad,
        },
        item.cantidad
      );
    }
    setAviso(
      algunoOmitido
        ? "Agregamos al carrito los productos que siguen disponibles — algunos de ese pedido ya no están en el catálogo."
        : "Agregamos todo ese pedido al carrito, con los precios de hoy."
    );
    abrirCarrito();
  }

  return (
    <section id="mis-pedidos" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16">
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Mis pedidos</h2>
      <p className="mt-2 text-sm text-muted">
        Escribe el teléfono con el que hiciste tu pedido para ver tu historial y pedir de nuevo en un clic.
      </p>

      <form onSubmit={buscar} className="mt-6 flex flex-wrap gap-3">
        <input
          type="tel"
          required
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej: +56 9 1234 5678"
          className="min-w-0 flex-1 rounded-full bg-card px-5 py-3 text-sm outline-none"
          style={{ border: "1px solid var(--card-border)" }}
        />
        <button
          type="submit"
          disabled={buscando}
          className="rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300 disabled:opacity-60"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm font-semibold" style={{ color: "var(--offer)" }}>
          {error}
        </p>
      )}
      {aviso && <p className="mt-4 text-sm font-semibold text-accent">{aviso}</p>}

      {pedidos && pedidos.length === 0 && (
        <p className="mt-6 rounded-xl bg-card p-6 text-muted" style={{ border: "1px solid var(--card-border)" }}>
          No encontramos pedidos con ese teléfono. Si acabas de escribirnos por WhatsApp, puede que tu pedido todavía
          no quede registrado acá — igual lo estamos viendo por WhatsApp.
        </p>
      )}

      {pedidos && pedidos.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {pedidos.map((p) => (
            <div key={p.id} className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-dark">
                  {new Date(p.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                  <span className="ml-2 text-muted">· {p.tipoEntrega === "despacho" ? "Despacho" : "Retiro en tienda"}</span>
                </p>
                <span className="tabular font-sans text-sm font-semibold text-accent">{formatoCLP(totalPedido(p))}</span>
              </div>

              <ul className="mt-3 flex flex-col gap-1 text-sm text-text">
                {p.items.map((item, i) => (
                  <li key={i}>
                    {item.descripcion}
                    {item.corte ? ` (${item.corte})` : ""} — {cantidadPedido(item.cantidad, item.unidad)}
                  </li>
                ))}
              </ul>

              {p.tipoEntrega === "despacho" && p.clienteDireccion && (
                <p className="mt-3 text-xs text-muted">
                  Despachado a {p.clienteDireccion}, {p.comunaNombre}
                </p>
              )}

              <button
                type="button"
                onClick={() => pedirDeNuevo(p)}
                className="mt-4 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
                style={{ background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--accent)" }}
              >
                Pedir de nuevo
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
