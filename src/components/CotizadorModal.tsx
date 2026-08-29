"use client";

import { useMemo, useState } from "react";
import { useCatalogoData, opcionesCorte } from "@/lib/catalogoData";
import { useCart, type Envasado } from "@/lib/cart";
import { formatoCLP } from "@/lib/format";
import { useUi } from "@/lib/ui";
import type { ProductoPublico } from "@/lib/types";

const PESO_MINIMO = 250;
const PESO_PASO = 50;
const CHIPS_PESO = [250, 500, 1000, 2000];

function redondearPaso(gramos: number): number {
  return Math.max(PESO_MINIMO, Math.round(gramos / PESO_PASO) * PESO_PASO);
}

// El campo de peso se edita en kilos (con decimales, ej. "1.3") porque así
// piensa la gente al comprar carne — puertas adentro (pesoGramos) se sigue
// guardando en gramos, que es lo que necesita el resto del cotizador.
function formatoKgInput(gramos: number): string {
  const kg = gramos / 1000;
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default function CotizadorModal() {
  const { productoCotizando, cerrarCotizador } = useUi();
  const { cortes } = useCatalogoData();

  if (!productoCotizando) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={cerrarCotizador}>
      {/* key por idPos: remonta el formulario con estado limpio cada vez que
          se cotiza un producto distinto, en vez de resetearlo con un efecto. */}
      <CotizadorFormulario key={productoCotizando.idPos} producto={productoCotizando} cortes={cortes} />
    </div>
  );
}

function CotizadorFormulario({
  producto: p,
  cortes,
}: {
  producto: ProductoPublico;
  cortes: ReturnType<typeof useCatalogoData>["cortes"];
}) {
  const { cerrarCotizador } = useUi();
  const { agregar } = useCart();
  const opciones = useMemo(() => opcionesCorte(cortes, p.familiaCorte), [cortes, p.familiaCorte]);
  const esPeso = p.unidad === "kg";

  // El peso se edita en kilos, como texto libre (no un <input type="number">
  // en gramos): así se puede escribir "1.3" directo, que es como la gente
  // piensa una compra de carne, en vez de tener que convertir a 1300 a mano.
  // pesoGramos se deriva de este texto en cada render; solo se re-formatea
  // (redondeo a los 50 g más cercanos) al perder el foco o al venir de un
  // chip/el monto, nunca mientras se está escribiendo.
  const [pesoKgTexto, setPesoKgTexto] = useState(formatoKgInput(PESO_MINIMO));
  const [cantidadUnidades, setCantidadUnidades] = useState(1);
  const [corte, setCorte] = useState<string | null>(opciones[0] ?? null);
  const [envasado, setEnvasado] = useState<Envasado | null>(esPeso ? "Tradicional" : null);
  const [instrucciones, setInstrucciones] = useState("");

  const pesoGramosTexto = Math.round((parseFloat(pesoKgTexto.replace(",", ".")) || 0) * 1000);
  const pesoGramos = pesoGramosTexto > 0 ? pesoGramosTexto : PESO_MINIMO;

  // Cantidad de trozos aproximada — se deriva del peso actual (no se guarda
  // aparte), así siempre queda consistente sea cual sea el campo que se
  // haya editado (peso, monto o los mismos trozos). Solo aplica a productos
  // donde el POS configuró un peso promedio por trozo (típicamente
  // pollo/aves); ver Producto.pesoPromedioTrozoGramos.
  const trozosAprox = p.pesoPromedioTrozoGramos ? Math.max(1, Math.round(pesoGramos / p.pesoPromedioTrozoGramos)) : null;

  function elegirTrozos(cantidad: number) {
    if (!p.pesoPromedioTrozoGramos) return;
    const gramos = redondearPaso(Math.max(1, cantidad) * p.pesoPromedioTrozoGramos);
    setPesoKgTexto(formatoKgInput(gramos));
  }

  const promoAplica =
    esPeso && p.promoPrecioUnitario != null && p.promoGramosMinimos != null && pesoGramos >= p.promoGramosMinimos;
  const precioEfectivo = promoAplica ? p.promoPrecioUnitario! : p.precio;

  const subtotal = esPeso ? Math.round((precioEfectivo * pesoGramos) / 1000) : precioEfectivo * cantidadUnidades;
  const monto = Math.round((precioEfectivo * pesoGramos) / 1000);

  function elegirChip(gramos: number) {
    setPesoKgTexto(formatoKgInput(gramos));
  }

  function cambiarMonto(valor: number) {
    const gramos = redondearPaso((valor / precioEfectivo) * 1000);
    setPesoKgTexto(formatoKgInput(gramos));
  }

  function corregirPesoAlSalir() {
    setPesoKgTexto(formatoKgInput(redondearPaso(pesoGramos)));
  }

  function confirmarAgregar() {
    // Cuando el producto tiene peso promedio por trozo, se le avisa al
    // equipo cuántos trozos aprox. corresponden al peso pedido — así saben
    // cortar esa cantidad de piezas, no solo pesar un pedazo cualquiera
    // hasta llegar al peso.
    const notaTrozos = trozosAprox != null ? `≈${trozosAprox} trozo${trozosAprox === 1 ? "" : "s"} aprox.` : null;
    const instruccionesFinal = [notaTrozos, instrucciones.trim() || null].filter(Boolean).join(" — ") || null;

    agregar(
      {
        idPos: p.idPos,
        plu: p.plu,
        descripcion: p.descripcion,
        corte,
        envasado,
        instrucciones: instruccionesFinal,
        precio: precioEfectivo,
        unidad: p.unidad,
      },
      esPeso ? pesoGramos : cantidadUnidades
    );
    cerrarCotizador();
  }

  return (
    <div
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 sm:rounded-2xl"
      style={{ boxShadow: "0 -8px 30px rgba(0,0,0,.25)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">{p.categoriaNombre}</p>
            <h3 className="font-display text-2xl text-dark">{p.descripcion}</h3>
            {p.marca && <p className="text-sm font-bold text-accent">{p.marca}</p>}
            <p className="tabular mt-1 font-sans text-lg font-semibold text-accent">
              {formatoCLP(p.precio)} <span className="text-sm font-normal text-muted">{esPeso ? "por kilo" : "por unidad"}</span>
            </p>
          </div>
          <button type="button" onClick={cerrarCotizador} className="rounded-full px-3 py-1 text-sm text-muted hover:text-dark">
            Cerrar
          </button>
        </div>

        {esPeso ? (
          <div className="mt-5 rounded-xl p-4" style={{ background: "var(--dark)" }}>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-xs text-gold">
                Peso (kg)
                <input
                  type="text"
                  inputMode="decimal"
                  value={pesoKgTexto}
                  onChange={(e) => setPesoKgTexto(e.target.value)}
                  onBlur={corregirPesoAlSalir}
                  className="tabular rounded-lg bg-transparent px-3 py-2 text-xl font-bold text-background"
                  style={{ border: "1px solid rgba(196,165,116,.4)" }}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gold">
                Monto (CLP)
                <input
                  type="number"
                  min={0}
                  value={monto}
                  onChange={(e) => cambiarMonto(Number(e.target.value) || 0)}
                  className="tabular rounded-lg bg-transparent px-3 py-2 text-xl font-bold text-background"
                  style={{ border: "1px solid rgba(196,165,116,.4)" }}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CHIPS_PESO.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => elegirChip(g)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-gold transition-colors duration-300"
                  style={{ border: "1px solid rgba(196,165,116,.4)" }}
                >
                  {g < 1000 ? `${g} g` : `${g / 1000} kg`}
                </button>
              ))}
            </div>

            {trozosAprox != null && (
              <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(196,165,116,.25)" }}>
                <p className="text-xs text-gold">¿Prefieres pedir por cantidad de trozos?</p>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => elegirTrozos(trozosAprox - 1)}
                    className="h-9 w-9 rounded-full text-lg font-bold text-background"
                    style={{ border: "1px solid rgba(196,165,116,.4)" }}
                  >
                    −
                  </button>
                  <span className="tabular font-sans text-lg font-bold text-background">
                    {trozosAprox} trozo{trozosAprox === 1 ? "" : "s"}
                  </span>
                  <button
                    type="button"
                    onClick={() => elegirTrozos(trozosAprox + 1)}
                    className="h-9 w-9 rounded-full text-lg font-bold text-background"
                    style={{ border: "1px solid rgba(196,165,116,.4)" }}
                  >
                    +
                  </button>
                </div>
                <p className="mt-1 text-xs text-gold opacity-80">Peso estimado — se ajusta al pesar de verdad.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-center gap-6 rounded-xl p-6" style={{ background: "var(--dark)" }}>
            <button
              type="button"
              onClick={() => setCantidadUnidades((n) => Math.max(1, n - 1))}
              className="h-11 w-11 rounded-full text-xl font-bold text-background"
              style={{ border: "1px solid rgba(196,165,116,.4)" }}
            >
              −
            </button>
            <span className="tabular font-sans text-3xl font-bold text-background">{cantidadUnidades}</span>
            <button
              type="button"
              onClick={() => setCantidadUnidades((n) => n + 1)}
              className="h-11 w-11 rounded-full text-xl font-bold text-background"
              style={{ border: "1px solid rgba(196,165,116,.4)" }}
            >
              +
            </button>
          </div>
        )}

        {opciones.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-dark">Corte</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {opciones.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setCorte(o)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                  style={
                    corte === o
                      ? { background: "var(--accent)", color: "var(--background)" }
                      : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--card-border)" }
                  }
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {esPeso && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-dark">Envasado</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["Tradicional", "Al vacío"] as Envasado[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setEnvasado(o)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300"
                  style={
                    envasado === o
                      ? { background: "var(--accent)", color: "var(--background)" }
                      : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--card-border)" }
                  }
                >
                  {o}
                </button>
              ))}
            </div>
            {envasado === "Al vacío" && (
              <p className="mt-2 text-xs text-muted">
                La carne envasada al vacío puede verse más oscura por la ausencia de oxígeno — es normal, recupera su
                color al exponerse al aire.
              </p>
            )}
          </div>
        )}

        <label className="mt-5 flex flex-col gap-1 text-sm font-semibold text-dark">
          Instrucciones especiales (opcional)
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value.slice(0, 300))}
            rows={2}
            className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
            style={{ border: "1px solid var(--card-border)" }}
          />
        </label>

        {promoAplica && p.promoEtiqueta && (
          <p className="mt-4 text-sm font-semibold" style={{ color: "var(--offer)" }}>
            Promo aplicada: {p.promoEtiqueta}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-muted">Subtotal estimado</span>
          <span className="tabular font-sans text-2xl font-bold text-accent">{formatoCLP(subtotal)}</span>
        </div>

        <button
          type="button"
          onClick={confirmarAgregar}
          className="mt-4 w-full rounded-lg py-3 text-sm font-semibold transition-colors duration-300"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          Agregar al pedido
        </button>
    </div>
  );
}
