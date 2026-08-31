"use client";

import { useMemo, useState } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import type { ProductoPublico } from "@/lib/types";
import ProductoCard from "./ProductoCard";

const ORDEN_CATEGORIAS = [
  "Combos",
  "Pollo",
  "Cerdo",
  "Vacuno",
  "Artesanales",
  "Congelados",
  "Envasado Entero",
  "Frutas y Hortalizas",
];

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

function ordenarCategorias(categorias: string[]): string[] {
  return [...categorias].sort((a, b) => {
    const ia = ORDEN_CATEGORIAS.indexOf(a);
    const ib = ORDEN_CATEGORIAS.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "es");
  });
}

// Los pilares grandes de la pantalla de entrada — a pedido del usuario,
// para que en el celular no haya que scrollear el catálogo entero para
// llegar a lo que se busca. "candidatos" cubre variantes del nombre real
// de la categoría (ej. el POS puede tener "Pollo" o "Aves"); se resuelve
// contra las categorías que realmente existen en el catálogo cargado, así
// que un pilar sin productos hoy simplemente no se muestra.
const PILARES = [
  { etiqueta: "Vacuno", candidatos: ["vacuno"] },
  { etiqueta: "Cerdo", candidatos: ["cerdo"] },
  { etiqueta: "Aves", candidatos: ["pollo", "aves"] },
  { etiqueta: "Congelados", candidatos: ["congelados"] },
  { etiqueta: "Artesanales", candidatos: ["artesanales"] },
];

function resolverCategoria(categorias: string[], candidatos: string[]): string | null {
  const normalizados = candidatos.map((c) => c.toLowerCase());
  return categorias.find((c) => normalizados.includes(c.trim().toLowerCase())) ?? null;
}

export default function Catalogo() {
  const { productos } = useCatalogoData();
  const [busqueda, setBusqueda] = useState("");
  // null = pantalla de entrada (los 5 pilares), sin filtro elegido todavía.
  const [chip, setChip] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("relevancia");

  const categorias = useMemo(
    () => ordenarCategorias(Array.from(new Set(productos.map((p) => p.categoriaNombre)))),
    [productos]
  );

  const pilares = useMemo(
    () =>
      PILARES.map((p) => ({ etiqueta: p.etiqueta, categoria: resolverCategoria(categorias, p.candidatos) })).filter(
        (p) => p.categoria != null
      ),
    [categorias]
  );

  const textoBusqueda = busqueda.trim().toLowerCase();
  const sinFiltros = chip === "Todos" && textoBusqueda === "" && orden === "relevancia";

  const filtrados = useMemo(() => {
    let lista = productos;
    if (chip === "Destacados") lista = lista.filter((p) => p.featured);
    else if (chip && chip !== "Todos") lista = lista.filter((p) => p.categoriaNombre === chip);

    if (textoBusqueda) {
      lista = lista.filter((p) =>
        [p.descripcion, p.marca, p.descripcionCorta, p.categoriaNombre]
          .filter(Boolean)
          .some((campo) => campo!.toLowerCase().includes(textoBusqueda))
      );
    }

    if (orden === "precio-asc") lista = [...lista].sort((a, b) => a.precio - b.precio);
    else if (orden === "precio-desc") lista = [...lista].sort((a, b) => b.precio - a.precio);
    else if (orden === "nombre") lista = [...lista].sort((a, b) => a.descripcion.localeCompare(b.descripcion, "es"));

    return lista;
  }, [productos, chip, textoBusqueda, orden]);

  const agrupados = useMemo(() => {
    if (!sinFiltros) return null;
    const mapa = new Map<string, ProductoPublico[]>();
    for (const p of filtrados) {
      const lista = mapa.get(p.categoriaNombre);
      if (lista) lista.push(p);
      else mapa.set(p.categoriaNombre, [p]);
    }
    return ordenarCategorias(Array.from(mapa.keys())).map((cat) => [cat, mapa.get(cat)!] as const);
  }, [sinFiltros, filtrados]);

  return (
    <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Catálogo</h2>
      <p className="mt-2 text-sm text-muted">
        Precios, stock y fotos referenciales, sujetos a confirmación por WhatsApp.
      </p>

      {chip === null ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pilares.map((p) => (
            <button
              key={p.etiqueta}
              type="button"
              onClick={() => setChip(p.categoria)}
              className="rounded-2xl px-6 py-8 text-center font-display text-2xl transition-colors duration-300"
              style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--card-border)" }}
            >
              {p.etiqueta}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setChip("Todos")}
            className="rounded-2xl px-6 py-8 text-center font-display text-2xl transition-colors duration-300 sm:col-span-2"
            style={{ background: "var(--accent)", color: "var(--background)" }}
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <>
      <button
        type="button"
        onClick={() => {
          setChip(null);
          setBusqueda("");
        }}
        className="mt-6 text-sm font-medium text-accent"
      >
        ← Volver a categorías
      </button>

      <div className="mt-4 flex flex-col gap-4">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto…"
          className="w-full rounded-full bg-card px-5 py-3 text-sm outline-none"
          style={{ border: "1px solid var(--card-border)" }}
        />

        <div className="flex flex-wrap gap-2">
          {["Todos", "Destacados", ...categorias].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChip(c)}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300"
              style={
                chip === c
                  ? { background: "var(--accent)", color: "var(--background)" }
                  : { background: "var(--card)", color: "var(--text)", border: "1px solid var(--card-border)" }
              }
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          className="w-fit rounded-full bg-card px-4 py-2 text-sm outline-none"
          style={{ border: "1px solid var(--card-border)" }}
        >
          <option value="relevancia">Ordenar: relevancia</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre A-Z</option>
        </select>
      </div>

      {filtrados.length === 0 && (
        <p className="mt-10 rounded-lg bg-card p-6 text-center text-muted" style={{ border: "1px solid var(--card-border)" }}>
          No encontramos productos con ese filtro.
        </p>
      )}

      {agrupados ? (
        <div className="mt-10 flex flex-col gap-10">
          {agrupados.map(([categoria, items]) => (
            <div key={categoria}>
              <div className="mb-4 flex items-center gap-4">
                <h3 className="whitespace-nowrap font-display text-2xl text-accent">{categoria}</h3>
                <span className="separador-categoria flex-1" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductoCard key={p.idPos} producto={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <ProductoCard key={p.idPos} producto={p} />
          ))}
        </div>
      )}
        </>
      )}
    </section>
  );
}
