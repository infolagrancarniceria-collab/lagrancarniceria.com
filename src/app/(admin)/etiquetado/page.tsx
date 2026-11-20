import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { TEXTO_SELLO, formatoEntero } from "@/lib/etiquetado/calculo";
import { calcularProducto, mapaIngredientes, mermaDeLote } from "@/lib/etiquetado/datos";

export default async function EtiquetadoInicio() {
  await requerirSesion();
  const [productos, ingredientes, rotulo] = await Promise.all([
    prisma.productoArtesanal.findMany({
      orderBy: { nombre: "asc" },
      include: { items: true, lotes: { orderBy: { fechaElaboracion: "desc" }, take: 1 } },
    }),
    mapaIngredientes(),
    prisma.datosRotulo.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark">Productos artesanales</h1>
          <p className="text-sm text-muted">
            Receta → tabla nutricional y sellos &quot;ALTO EN&quot; según el Manual de Etiquetado del MINSAL.
          </p>
        </div>
        <Link href="/etiquetado/productos/nuevo" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background">
          + Nuevo producto
        </Link>
      </div>

      {!rotulo && (
        <p className="mt-4 rounded-lg border border-offer/40 bg-card p-3 text-sm">
          Faltan los <Link href="/etiquetado/empresa" className="underline">datos del rótulo</Link> (razón social,
          domicilio, resolución sanitaria) — las etiquetas los necesitan.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((p) => {
          const ultimo = p.lotes[0];
          const merma = ultimo ? mermaDeLote(ultimo) : p.mermaPct;
          const r = calcularProducto(p, ingredientes, merma);
          return (
            <Link
              key={p.id}
              href={`/etiquetado/productos/${p.id}`}
              className="rounded-xl border border-card-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <h2 className="font-bold text-dark">{p.nombre}</h2>
              <p className="mt-1 text-xs text-muted">
                {p.items.length} ingredientes · porción {formatoEntero(p.porcionG)} g · merma{" "}
                {merma.toLocaleString("es-CL", { maximumFractionDigits: 1 })} %{ultimo ? ` (lote ${ultimo.codigo})` : " (típica)"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatoEntero(r.por100.energiaKcal)} kcal · {formatoEntero(r.por100.sodioMg)} mg sodio por 100 g
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.sellosQueCorresponden.length === 0 ? (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs">Sin sellos</span>
                ) : (
                  r.sellosQueCorresponden.map((s) => (
                    <span key={s} className="rounded-full bg-dark px-2 py-0.5 text-xs font-bold text-background">
                      ALTO EN {TEXTO_SELLO[s]}
                    </span>
                  ))
                )}
                {p.publicarEnWeb && <span className="rounded-full bg-gold/30 px-2 py-0.5 text-xs">En la web</span>}
              </div>
            </Link>
          );
        })}
        {productos.length === 0 && <p className="text-sm text-muted">Todavía no hay productos.</p>}
      </div>
    </div>
  );
}
