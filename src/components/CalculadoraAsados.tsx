"use client";

import { useMemo, useState } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import { useCart } from "@/lib/cart";
import { formatoCLP, formatoPeso, redondear50 } from "@/lib/format";
import type { ProductoPublico } from "@/lib/types";

type Apetito = "liviano" | "normal" | "carnivoro";
type TipoCarne = "Vacuno" | "Pollo" | "Cerdo" | "mix";

const GRAMOS_POR_PERSONA: Record<Apetito, number> = { liviano: 250, normal: 350, carnivoro: 500 };

// Corte curado por tipo de carne para la sugerencia automática de asado
// (sección 6 del prompt de diseño) — se busca por nombre dentro de la
// categoría correspondiente; si no existe o está agotado, se omite en
// silencio.
const CORTE_CURADO: Record<"Vacuno" | "Pollo" | "Cerdo", string> = {
  Vacuno: "asado carnicero",
  Pollo: "trutro entero",
  Cerdo: "chuleta parrillera",
};

function buscarCorteCurado(productos: ProductoPublico[], categoria: "Vacuno" | "Pollo" | "Cerdo") {
  const nombre = CORTE_CURADO[categoria];
  return productos.find(
    (p) => p.categoriaNombre === categoria && p.disponibilidad === "disponible" && p.descripcion.toLowerCase().includes(nombre)
  );
}

export default function CalculadoraAsados() {
  const { productos } = useCatalogoData();
  const { agregar } = useCart();

  const [personas, setPersonas] = useState(4);
  const [apetito, setApetito] = useState<Apetito>("normal");
  const [tipoCarne, setTipoCarne] = useState<TipoCarne>("mix");

  const totalGramos = redondear50(personas * GRAMOS_POR_PERSONA[apetito]);

  const desglose = useMemo<Partial<Record<"Vacuno" | "Pollo" | "Cerdo", number>>>(() => {
    if (tipoCarne === "mix") {
      const porTipo = redondear50(totalGramos / 3);
      return { Vacuno: porTipo, Pollo: porTipo, Cerdo: porTipo };
    }
    return { [tipoCarne]: totalGramos };
  }, [tipoCarne, totalGramos]);

  const combo = useMemo(() => {
    return (Object.entries(desglose) as [keyof typeof desglose, number][])
      .filter(([, gramos]) => gramos! > 0)
      .map(([categoria, gramos]) => {
        const producto = buscarCorteCurado(productos, categoria as "Vacuno" | "Pollo" | "Cerdo");
        if (!producto) return null;
        return { producto, gramos: gramos!, precio: Math.round((producto.precio * gramos!) / 1000) };
      })
      .filter((x): x is { producto: ProductoPublico; gramos: number; precio: number } => x !== null);
  }, [desglose, productos]);

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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg p-4" style={{ background: "var(--surface)" }}>
            <p className="text-sm text-text">
              Sugerencia: {combo.map((c) => `${c.producto.descripcion} ${formatoPeso(c.gramos)}`).join(" + ")}
              <span className="tabular ml-2 font-sans font-semibold text-accent">{formatoCLP(totalCombo)}</span>
            </p>
            <button
              type="button"
              onClick={agregarCombo}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
              style={{ background: "var(--accent)", color: "var(--background)" }}
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
