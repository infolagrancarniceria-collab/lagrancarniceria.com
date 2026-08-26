"use client";

import { useCart } from "@/lib/cart";
import { formatoCLP, formatoPeso } from "@/lib/format";
import { subtotalItem, totalCarrito } from "@/lib/pricing";
import { useUi } from "@/lib/ui";

export default function CarritoDrawer() {
  const { carritoAbierto, cerrarCarrito, abrirConfirmar } = useUi();
  const { items, actualizarCantidad, quitar } = useCart();

  if (!carritoAbierto) return null;

  const paso = (unidad: "kg" | "unidad") => (unidad === "kg" ? 50 : 1);
  const minimo = (unidad: "kg" | "unidad") => (unidad === "kg" ? 250 : 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={cerrarCarrito}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6"
        style={{ boxShadow: "0 -8px 30px rgba(0,0,0,.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-dark">Mi pedido</h3>
          <button type="button" onClick={cerrarCarrito} className="text-sm text-muted hover:text-dark">
            Cerrar
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-center text-muted">Todavía no agregaste productos.</p>
        ) : (
          <>
            <ul className="mt-5 flex flex-col gap-4">
              {items.map((item) => (
                <li key={`${item.idPos}::${item.corte ?? ""}`} className="pb-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg text-dark">{item.descripcion}</p>
                      <p className="text-sm text-muted">
                        {[item.corte, item.envasado].filter(Boolean).join(" · ")}
                        {item.instrucciones ? ` · ${item.instrucciones}` : ""}
                      </p>
                    </div>
                    <button type="button" onClick={() => quitar(item.idPos, item.corte)} className="text-sm text-muted hover:text-accent">
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const nueva = item.cantidad - paso(item.unidad);
                          // Bajar del mínimo (250 g / 1 un.) quita la línea en vez de
                          // dejar una cantidad inválida — mismo mínimo que exige el
                          // cotizador al agregar.
                          actualizarCantidad(item.idPos, item.corte, nueva < minimo(item.unidad) ? 0 : nueva);
                        }}
                        className="h-8 w-8 rounded-full text-sm font-bold"
                        style={{ border: "1px solid var(--card-border)" }}
                      >
                        −
                      </button>
                      <span className="tabular w-20 text-center text-sm font-semibold text-dark">
                        {item.unidad === "kg" ? formatoPeso(item.cantidad) : `${item.cantidad} un.`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          actualizarCantidad(item.idPos, item.corte, Math.max(minimo(item.unidad), item.cantidad + paso(item.unidad)))
                        }
                        className="h-8 w-8 rounded-full text-sm font-bold"
                        style={{ border: "1px solid var(--card-border)" }}
                      >
                        +
                      </button>
                    </div>
                    <span className="tabular font-sans font-semibold text-accent">{formatoCLP(subtotalItem(item))}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-dark">Total</span>
              <span className="tabular font-sans text-2xl font-bold text-accent">{formatoCLP(totalCarrito(items))}</span>
            </div>

            <button
              type="button"
              onClick={abrirConfirmar}
              className="mt-4 w-full rounded-lg py-3 text-sm font-semibold transition-colors duration-300"
              style={{ background: "var(--accent)", color: "var(--background)" }}
            >
              Confirmar pedido
            </button>
          </>
        )}
      </div>
    </div>
  );
}
