import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatoCLP } from "@/lib/format";
import ProductoFila from "@/components/ProductoFila";

// Renderizado en cada visita (no estático): el tráfico del sitio es bajo,
// así que consultar Postgres en cada request no pesa, y evita depender de
// que la base de datos esté disponible justo al momento de cada deploy
// (algo que sí importaría con generación estática/ISR).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Precios y despacho — La Gran Carnicería",
};

function agrupar<T, K extends string>(items: T[], clave: (item: T) => K): Map<K, T[]> {
  const mapa = new Map<K, T[]>();
  for (const item of items) {
    const k = clave(item);
    const lista = mapa.get(k);
    if (lista) lista.push(item);
    else mapa.set(k, [item]);
  }
  return mapa;
}

export default async function PreciosPage() {
  let productos: Awaited<ReturnType<typeof prisma.producto.findMany>> = [];
  let comunas: Awaited<ReturnType<typeof prisma.comuna.findMany>> = [];
  let cortes: Awaited<ReturnType<typeof prisma.corteOpcion.findMany>> = [];
  let errorCarga = false;

  try {
    [productos, comunas, cortes] = await Promise.all([
      prisma.producto.findMany({ orderBy: { descripcion: "asc" } }),
      prisma.comuna.findMany({ orderBy: { costoEnvio: "asc" } }),
      prisma.corteOpcion.findMany({ orderBy: { orden: "asc" } }),
    ]);
  } catch (err) {
    console.error("[precios] no se pudo consultar la base de datos:", err);
    errorCarga = true;
  }

  if (errorCarga) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold">Precios</h1>
        <p className="mt-6 rounded-lg border border-surface-border bg-surface p-6 text-muted">
          No pudimos cargar los precios en este momento. Escríbenos por WhatsApp y te ayudamos directamente.
        </p>
      </div>
    );
  }

  const productosPorCategoria = agrupar(productos, (p) => p.categoriaNombre);
  const cortesPorFamilia = agrupar(cortes, (c) => c.familia);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold">Precios</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Precios sincronizados directamente desde nuestro sistema — pueden variar levemente según el peso exacto de
        cada corte, que se confirma al preparar tu pedido.
      </p>

      {productos.length === 0 && (
        <p className="mt-10 rounded-lg border border-surface-border bg-surface p-6 text-muted">
          Todavía no hay productos publicados. Vuelve a revisar pronto.
        </p>
      )}

      <div className="mt-10 flex flex-col gap-12">
        {Array.from(productosPorCategoria.entries()).map(([categoria, items]) => (
          <section key={categoria}>
            <h2 className="font-display text-2xl font-semibold text-accent-strong">{categoria}</h2>
            <ul className="mt-4 divide-y divide-surface-border rounded-lg border border-surface-border bg-surface">
              {items.map((p) => (
                <ProductoFila
                  key={p.idPos}
                  idPos={p.idPos}
                  descripcion={p.descripcion}
                  precio={p.precio}
                  unidad={p.unidad === "kg" ? "kg" : "unidad"}
                  agotado={p.agotado}
                  opcionesCorte={(p.familiaCorte ? cortesPorFamilia.get(p.familiaCorte) : undefined)?.map(
                    (c) => c.nombre
                  ) ?? []}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section id="despacho" className="mt-20 scroll-mt-20">
        <h2 className="font-display text-3xl font-bold">Valores de despacho</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Valores referenciales por comuna — consulta por tu sector al momento de hacer tu pedido.
        </p>
        {comunas.length === 0 ? (
          <p className="mt-6 rounded-lg border border-surface-border bg-surface p-6 text-muted">
            Los valores de despacho todavía no están publicados.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {comunas.map((c) => (
              <li
                key={c.nombre}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface px-5 py-3"
              >
                <span>{c.nombre}</span>
                <span className="font-display font-semibold text-accent">
                  {c.costoEnvio === 0 ? "Gratis" : formatoCLP(c.costoEnvio)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
