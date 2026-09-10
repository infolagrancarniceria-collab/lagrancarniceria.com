"use client";

import { useMemo, useState } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import { useCart } from "@/lib/cart";
import { formatoCLP, formatoPeso, redondear50 } from "@/lib/format";
import type { ProductoPublico } from "@/lib/types";

type Apetito = "liviano" | "normal" | "carnivoro";
type TipoCarne = "Vacuno" | "Pollo" | "Cerdo" | "mix";
type Categoria = "Vacuno" | "Pollo" | "Cerdo";

const GRAMOS_POR_PERSONA: Record<Apetito, number> = { liviano: 250, normal: 350, carnivoro: 500 };

// Cortes preferidos para asado por categoría, en orden de preferencia (el
// primero disponible es el default; si hay más de uno disponible, la
// persona puede elegir con los chips de abajo). Se busca por nombre dentro
// de la categoría — si un corte no existe en el catálogo o está agotado, se
// omite en silencio y se prueba el siguiente de la lista.
const CORTES_PREFERIDOS: Record<Categoria, string[]> = {
  Vacuno: ["asado carnicero"],
  Pollo: ["trutro entero"],
  Cerdo: ["chuleta parrillera"],
};

function buscarCortesDisponibles(productos: ProductoPublico[], categoria: Categoria): ProductoPublico[] {
  const nombres = CORTES_PREFERIDOS[categoria];
  const encontrados: ProductoPublico[] = [];
  for (const nombre of nombres) {
    const producto = productos.find(
      (p) => p.categoriaNombre === categoria && p.disponibilidad === "disponible" && p.descripcion.toLowerCase().includes(nombre)
    );
    if (producto && !encontrados.some((e) => e.idPos === producto.idPos)) encontrados.push(producto);
  }
  return encontrados;
}

export default function CalculadoraAsados() {
  const { productos } = useCatalogoData();
  const { agregar } = useCart();

  const [personas, setPersonas] = useState(4);
  const [apetito, setApetito] = useState<Apetito>("normal");
  const [tipoCarne, setTipoCarne] = useState<TipoCarne>("mix");
  // Corte elegido a mano por categoría (idPos) — si la persona no elige
  // nada, se usa el primero disponible de CORTES_PREFERIDOS.
  const [corteElegido, setCorteElegido] = useState<Partial<Record<Categoria, number>>>({});

  const totalGramos = redondear50(personas * GRAMOS_POR_PERSONA[apetito]);

  const desglose = useMemo<Partial<Record<Categoria, number>>>(() => {
    if (tipoCarne === "mix") {
      const porTipo = redondear50(totalGramos / 3);
      return { Vacuno: porTipo, Pollo: porTipo, Cerdo: porTipo };
    }
    return { [tipoCarne]: totalGramos };
  }, [tipoCarne, totalGramos]);

  const combo = useMemo(() => {
    return (Object.entries(desglose) as [Categoria, number][])
      .filter(([, gramos]) => gramos > 0)
      .map(([categoria, gramos]) => {
        const disponibles = buscarCortesDisponibles(productos, categoria);
        if (disponibles.length === 0) return null;
        const elegidoId = corteElegido[categoria];
        const producto = disponibles.find((p) => p.idPos === elegidoId) ?? disponibles[0];
        return { categoria, producto, opciones: disponibles, gramos, precio: Math.round((producto.precio * gramos) / 1000) };
      })
      .filter(
        (x): x is { categoria: Categoria; producto: ProductoPublico; opciones: ProductoPublico[]; gramos: number; precio: number } =>
          x !== null
      );
  }, [desglose, productos, corteElegido]);

  const totalCombo = combo.reduce((acc, c) => acc + c.precio, 0);

  function agregarCombo() {
    for (const c of combo) {
      agregar(
        {
          idPos: c.producto.idPos,
          plu: c.producto.plu,
          descripcion: c.producto.descripcion,
          corte: null,
          envasado: "Tradicional",
          instrucciones: null,
          precio: c.producto.precio,
          unidad: "kg",
        },
        c.gramos
      );
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
        <div className="flex flex-wrap items-center gap-4">
          <p className="font-display text-sm text-dark">Calculadora de asados</p>

          <label className="flex items-center gap-2 text-sm text-muted">
            Personas
            <input
              type="number"
              min={1}
              max={30}
              value={personas}
              onChange={(e) => setPersonas(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
              className="tabular w-16 rounded-lg px-2 py-1 text-sm font-semibold text-dark outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            />
          </label>

          <div className="flex gap-1.5">
            {(
              [
                ["liviano", "Liviano"],
                ["normal", "Normal"],
                ["carnivoro", "Carnívoro"],
              ] as [Apetito, string][]
            ).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setApetito(valor)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300"
                style={
                  apetito === valor
                    ? { background: "var(--accent)", color: "var(--background)" }
                    : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--card-border)" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {(
              [
                ["Vacuno", "Vacuno"],
                ["Pollo", "Pollo"],
                ["Cerdo", "Cerdo"],
                ["mix", "Mix de los 3"],
              ] as [TipoCarne, string][]
            ).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setTipoCarne(valor)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300"
                style={
                  tipoCarne === valor
                    ? { background: "var(--accent)", color: "var(--background)" }
                    : { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--card-border)" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          <span className="tabular ml-auto text-sm font-semibold text-accent">Total: {formatoPeso(totalGramos)}</span>
        </div>

        {tipoCarne === "mix" && (
          <p className="mt-2 text-xs text-muted">
            {(["Vacuno", "Pollo", "Cerdo"] as const).map((c) => `${c} ${formatoPeso(desglose[c] ?? 0)}`).join(" · ")}
          </p>
        )}

        {combo.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg p-4" style={{ background: "var(--surface)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sugerencia</p>

            <div className="flex flex-col gap-2.5">
              {combo.map((c) => (
                <div key={c.categoria} className="flex flex-wrap items-center gap-2">
                  {c.opciones.length > 1 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {c.opciones.map((op) => (
                        <button
                          key={op.idPos}
                          type="button"
                          onClick={() => setCorteElegido((actual) => ({ ...actual, [c.categoria]: op.idPos }))}
                          className="rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300"
                          style={
                            op.idPos === c.producto.idPos
                              ? { background: "var(--accent)", color: "var(--background)" }
                              : { background: "var(--card)", color: "var(--text)", border: "1px solid var(--card-border)" }
                          }
                        >
                          {op.descripcion}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-text">{c.producto.descripcion}</span>
                  )}
                  <span className="tabular text-sm text-muted">{formatoPeso(c.gramos)}</span>
                  <span className="tabular ml-auto text-sm font-semibold text-dark">{formatoCLP(c.precio)}</span>
                </div>
              ))}
            </div>

            <div className="mt-1 flex items-center justify-between gap-3" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "0.75rem" }}>
              <span className="tabular text-base font-semibold text-accent">Total: {formatoCLP(totalCombo)}</span>
              <button
                type="button"
                onClick={agregarCombo}
                className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
                style={{ background: "var(--accent)", color: "var(--background)" }}
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
