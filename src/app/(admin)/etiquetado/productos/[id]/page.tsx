import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { aIngredienteCalculo, aItemReceta, fechaVencimientoLote, formatoFecha, mermaDeLote } from "@/lib/etiquetado/datos";
import { eliminarLote, eliminarProducto } from "../../acciones";
import EditorProducto from "./EditorProducto";
import FormLote from "./FormLote";

export default async function ProductoPage({ params }: PageProps<"/etiquetado/productos/[id]">) {
  await requerirSesion();
  const { id } = await params;
  const esNuevo = id === "nuevo";
  const [producto, ingredientes, catalogo] = await Promise.all([
    esNuevo
      ? null
      : prisma.productoArtesanal.findUnique({
          where: { id: Number(id) || 0 },
          include: { items: { orderBy: { orden: "asc" } }, lotes: { orderBy: { fechaElaboracion: "desc" } } },
        }),
    prisma.ingredienteNutricional.findMany({ orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ select: { idPos: true, descripcion: true }, orderBy: { descripcion: "asc" } }),
  ]);
  if (!esNuevo && !producto) notFound();

  return (
    <div>
      <Link href="/etiquetado" className="text-sm text-accent">
        ← Productos
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-dark">{producto ? producto.nombre : "Nuevo producto"}</h1>
        {producto && (
          <Link
            href={`/etiquetado/productos/${producto.id}/etiqueta`}
            className="rounded-lg bg-dark px-4 py-2 text-sm font-bold text-background"
          >
            Emitir etiqueta →
          </Link>
        )}
      </div>

      <EditorProducto
        producto={
          producto
            ? {
                id: producto.id,
                nombre: producto.nombre,
                kgBase: producto.kgBase,
                mermaPct: producto.mermaPct,
                porcionG: producto.porcionG,
                porcionMedidaCasera: producto.porcionMedidaCasera,
                vidaUtilDias: producto.vidaUtilDias,
                almacenamiento: producto.almacenamiento,
                instruccionesUso: producto.instruccionesUso,
                leyendaAdicional: producto.leyendaAdicional,
                etiquetaAnchoCm: producto.etiquetaAnchoCm,
                etiquetaAltoCm: producto.etiquetaAltoCm,
                idPosWeb: producto.idPosWeb,
                publicarEnWeb: producto.publicarEnWeb,
                items: producto.items.map(aItemReceta),
              }
            : null
        }
        ingredientes={ingredientes.map(aIngredienteCalculo)}
        catalogo={catalogo}
      />

      {producto && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-dark">Lotes producidos (merma real)</h2>
          <p className="text-sm text-muted">
            Registra el peso antes y después de la cocción/ahumado/secado. La etiqueta de un lote usa su merma real; la web
            usa la del último lote.
          </p>
          <FormLote productoId={producto.id} kgBase={producto.kgBase} />
          {producto.lotes.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-card-border bg-card">
              <table className="w-full text-sm tabular">
                <thead className="bg-surface text-left text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2">Lote</th>
                    <th className="px-3 py-2">Elaboración</th>
                    <th className="px-3 py-2">Vencimiento</th>
                    <th className="px-3 py-2 text-right">Antes (kg)</th>
                    <th className="px-3 py-2 text-right">Final (kg)</th>
                    <th className="px-3 py-2 text-right">Merma</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {producto.lotes.map((l) => (
                    <tr key={l.id} className="border-t border-card-border">
                      <td className="px-3 py-2 font-semibold">{l.codigo}</td>
                      <td className="px-3 py-2">{formatoFecha(l.fechaElaboracion)}</td>
                      <td className="px-3 py-2">{formatoFecha(fechaVencimientoLote(l, producto.vidaUtilDias))}</td>
                      <td className="px-3 py-2 text-right">{(l.pesoAntesG / 1000).toLocaleString("es-CL")}</td>
                      <td className="px-3 py-2 text-right">{(l.pesoFinalG / 1000).toLocaleString("es-CL")}</td>
                      <td className="px-3 py-2 text-right">
                        {mermaDeLote(l).toLocaleString("es-CL", { maximumFractionDigits: 1 })} %
                      </td>
                      <td className="flex gap-3 px-3 py-2">
                        <Link href={`/etiquetado/productos/${producto.id}/etiqueta?lote=${l.id}`} className="text-accent underline">
                          Etiqueta
                        </Link>
                        <form action={eliminarLote}>
                          <input type="hidden" name="id" value={l.id} />
                          <button className="text-offer underline">Eliminar</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {producto && (
        <form action={eliminarProducto} className="mt-10 border-t border-card-border pt-4">
          <input type="hidden" name="id" value={producto.id} />
          <button className="text-sm text-offer underline">Eliminar producto (y sus lotes)</button>
        </form>
      )}
    </div>
  );
}
