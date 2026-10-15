"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import { construirJsonLdProductos } from "@/lib/structuredData";
import { esArtesanal, nombreVisible } from "@/lib/subMarca";
import type { ProductoPublico } from "@/lib/types";
import ProductoCard from "./ProductoCard";

// El nombre real de una categoría en el catálogo (cargado a mano en el POS)
// no siempre calza textualmente con lo que se supone acá — ya pasó que
// "Pollo" se terminó cargando como "Aves". Para no repetir ese bug cada vez
// que cambie una mayúscula o quede un espacio de más, TODA comparación de
// categoría pasa por esta normalización (sin tildes/mayúsculas/espacios
// extra) en vez de comparar el string tal cual.
function normalizarCategoria(c: string): string {
  return c
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Única fuente de verdad de "qué nombres reales puede tener cada categoría"
// — el orden de este array ES el orden de despliegue, y los mismos
// "equivalentes" se usan tanto para ordenar (ordenarCategorias) como para
// resolver los pilares grandes de la pantalla de entrada (PILARES más
// abajo), así las dos cosas no pueden quedar desincronizadas entre sí.
const CATEGORIAS_CONOCIDAS = [
  { etiqueta: "Combos", equivalentes: ["combos"] },
  { etiqueta: "Vacuno", equivalentes: ["vacuno"] },
  { etiqueta: "Pollo", equivalentes: ["pollo", "aves"] },
  { etiqueta: "Cerdo", equivalentes: ["cerdo"] },
  { etiqueta: "Artesanales", equivalentes: ["artesanales"] },
  { etiqueta: "Quesos", equivalentes: ["quesos", "queso"] },
  { etiqueta: "Congelados", equivalentes: ["congelados"] },
  { etiqueta: "Envasado Entero", equivalentes: ["envasado entero"] },
  { etiqueta: "Frutas y Hortalizas", equivalentes: ["frutas y hortalizas"] },
].map((c) => ({ ...c, equivalentes: c.equivalentes.map(normalizarCategoria) }));

function indiceCategoria(categoria: string): number {
  const norm = normalizarCategoria(categoria);
  return CATEGORIAS_CONOCIDAS.findIndex((c) => c.equivalentes.includes(norm));
}

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

function ordenarCategorias(categorias: string[]): string[] {
  return [...categorias].sort((a, b) => {
    const ia = indiceCategoria(a);
    const ib = indiceCategoria(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "es");
  });
}

// Los pilares grandes de la pantalla de entrada — a pedido del usuario,
// para que en el celular no haya que scrollear el catálogo entero para
// llegar a lo que se busca. Solo una parte de CATEGORIAS_CONOCIDAS tiene
// pilar propio; se resuelve contra las categorías que realmente existen en
// el catálogo cargado, así que un pilar sin productos hoy simplemente no
// se muestra.
const ETIQUETAS_PILARES = ["Vacuno", "Pollo", "Cerdo", "Artesanales", "Quesos", "Congelados"];

function resolverCategoria(categorias: string[], etiqueta: string): string | null {
  const entrada = CATEGORIAS_CONOCIDAS.find((c) => c.etiqueta === etiqueta);
  if (!entrada) return null;
  return categorias.find((c) => entrada.equivalentes.includes(normalizarCategoria(c))) ?? null;
}

export default function Catalogo() {
  const { productos } = useCatalogoData();
  const [busqueda, setBusqueda] = useState("");
  // null = pantalla de entrada (los 5 pilares), sin filtro elegido todavía.
  const [chip, setChip] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("relevancia");
  const [mostrarSubir, setMostrarSubir] = useState(false);
  // La barra de filtros se achica (solo categorías, en una fila) mientras
  // se scrollea hacia abajo leyendo productos, y se vuelve a abrir apenas
  // se scrollea hacia arriba — así deja de taparle pantalla al catálogo en
  // mobile sin perder el acceso rápido a cambiar de categoría.
  const [colapsada, setColapsada] = useState(false);
  const filtrosTopRef = useRef<HTMLDivElement>(null);
  const ultimoScrollY = useRef(0);
  // Mientras el scroll lo movemos nosotros (al cambiar de categoría o al
  // tocar "Subir"), no debe contar como el gesto de scroll del usuario que
  // colapsa/expande la barra — si no, la animación del scroll automático
  // queda parpadeando entre abierta y cerrada.
  const scrollProgramatico = useRef(false);

  // Ignora el scroll que provocamos nosotros mismos (al moverlo a mano, o
  // el que el navegador corrige solo cuando la barra sticky cambia de
  // alto — "scroll anchoring" — para que no se lea como un gesto del
  // usuario y rebote colapsando/expandiendo la barra sin parar.
  function silenciarScroll(ms: number) {
    scrollProgramatico.current = true;
    window.setTimeout(() => {
      scrollProgramatico.current = false;
    }, ms);
  }

  function scrollSuaveA(destino: number) {
    silenciarScroll(700);
    window.scrollTo({ top: destino, behavior: "smooth" });
  }

  // Cambia de categoría y deja la barra de filtros expandida — se usa en
  // vez de "setChip" directo en todos los botones que eligen categoría.
  function elegirChip(valor: string | null) {
    setChip(valor);
    setColapsada(false);
  }

  // Al cambiar de categoría (o entrar a la vista filtrada), vuelve al tope
  // de la lista — en mobile, antes había que scrollear todo el camino de
  // vuelta para arriba a mano cada vez que se cambiaba de chip.
  useEffect(() => {
    if (chip === null) return;
    const destino = (filtrosTopRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 96;
    scrollSuaveA(Math.max(destino, 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chip]);

  useEffect(() => {
    ultimoScrollY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setMostrarSubir(y > 600);
      if (scrollProgramatico.current) {
        ultimoScrollY.current = y;
        return;
      }
      // Umbral de 10px para no abrir/cerrar la barra con cada pixel que
      // tiembla el scroll (en touchpads/mobile el valor rara vez es
      // perfectamente estable) — solo reacciona a un gesto real.
      const delta = y - ultimoScrollY.current;
      if (y <= 140) {
        setColapsada(false);
      } else if (delta > 10) {
        setColapsada(true);
        silenciarScroll(400);
      } else if (delta < -10) {
        setColapsada(false);
        silenciarScroll(400);
      } else {
        return;
      }
      ultimoScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categorias = useMemo(
    () => ordenarCategorias(Array.from(new Set(productos.map((p) => p.categoriaNombre)))),
    [productos]
  );

  const pilares = useMemo(
    () =>
      ETIQUETAS_PILARES.map((etiqueta) => ({ etiqueta, categoria: resolverCategoria(categorias, etiqueta) })).filter(
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

  const jsonLdProductos = useMemo(() => construirJsonLdProductos(productos), [productos]);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProductos) }} />
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Catálogo</h2>
      <p
        className="mt-3 rounded-lg px-4 py-3 text-sm font-medium text-dark"
        style={{ background: "var(--surface)", border: "1px solid var(--gold)" }}
      >
        ℹ️ Los precios, el stock y las fotos son referenciales — el total final siempre se confirma por WhatsApp
        antes de despachar o entregar tu pedido.
      </p>

      {chip === null ? (
        <div className="mt-8 flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (busqueda.trim()) elegirChip("Todos");
            }}
          >
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto…"
              className="w-full rounded-full bg-card px-5 py-3 text-sm outline-none"
              style={{ border: "1px solid var(--card-border)" }}
            />
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => elegirChip("Todos")}
            className="rounded-2xl px-6 py-8 text-center font-display text-2xl transition-colors duration-300 sm:col-span-2"
            style={{ background: "var(--accent)", color: "var(--background)" }}
          >
            Ver todo el catálogo
          </button>
          {pilares.map((p) => {
            const charcuteria = p.categoria != null && esArtesanal(p.categoria);
            return (
              <button
                key={p.etiqueta}
                type="button"
                onClick={() => elegirChip(p.categoria)}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-8 text-center transition-colors duration-300"
                style={
                  charcuteria
                    ? { background: "var(--dark)", color: "var(--gold)", border: "1px solid var(--gold)" }
                    : { background: "var(--card)", color: "var(--text)", border: "1px solid var(--card-border)" }
                }
              >
                <span className="font-display text-2xl">{charcuteria ? "La Gran Charcutería" : p.etiqueta}</span>
                {charcuteria && <span className="text-xs font-medium tracking-wide opacity-80">Productos artesanales</span>}
              </button>
            );
          })}
          </div>
        </div>
      ) : (
        <>
      {/* Ancla sin "sticky": sirve de referencia real de scroll para volver
          al tope de la lista al cambiar de chip — si el ref apuntara a la
          barra sticky de abajo, el navegador la ve "ya visible" (al quedar
          pegada arriba) y el scroll-to-top no hace nada. */}
      <div ref={filtrosTopRef} className="scroll-mt-24" />
      <div
        className={`sticky top-24 z-30 -mx-4 bg-background px-4 transition-[padding] duration-300 ${
          colapsada ? "pb-2 pt-2" : "pb-4 pt-2"
        }`}
        style={{ overflowAnchor: "none" }}
      >
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
            colapsada ? "max-h-0 opacity-0" : "mb-4 max-h-32 opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setChip(null);
              setBusqueda("");
            }}
            className="mb-4 text-sm font-medium text-accent"
          >
            ← Volver a categorías
          </button>

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full rounded-full bg-card px-5 py-3 text-sm outline-none"
            style={{ border: "1px solid var(--card-border)" }}
          />
        </div>

        <div
          className={`flex gap-2 ${
            colapsada ? "flex-nowrap overflow-x-auto" : "flex-wrap"
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {["Todos", "Destacados", ...categorias].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => elegirChip(c)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300"
              style={
                chip === c
                  ? { background: "var(--accent)", color: "var(--background)" }
                  : { background: "var(--card)", color: "var(--text)", border: "1px solid var(--card-border)" }
              }
            >
              {nombreVisible(c)}
            </button>
          ))}
        </div>

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
            colapsada ? "max-h-0 opacity-0" : "mt-4 max-h-24 opacity-100"
          }`}
        >
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
                <h3
                  className="whitespace-nowrap font-display text-2xl"
                  style={{ color: esArtesanal(categoria) ? "var(--gold)" : "var(--accent)" }}
                >
                  {nombreVisible(categoria)}
                </h3>
                <span className="separador-categoria flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductoCard key={p.idPos} producto={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filtrados.map((p) => (
            <ProductoCard key={p.idPos} producto={p} />
          ))}
        </div>
      )}
        </>
      )}

      {mostrarSubir && (
        <button
          type="button"
          onClick={() => scrollSuaveA(0)}
          aria-label="Subir al inicio"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shadow-lg"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          ↑
        </button>
      )}
    </section>
  );
}
