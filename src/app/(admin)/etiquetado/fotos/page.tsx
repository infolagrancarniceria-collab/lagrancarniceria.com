import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { imagenProducto } from "@/lib/imagenesProductos";
import GaleriaFotos, { type ProductoFoto } from "./GaleriaFotos";
import { blobConfigurado } from "./acciones";

export default async function FotosPage() {
  await requerirSesion();
  const [productos, fotos] = await Promise.all([
    prisma.producto.findMany({
      select: { idPos: true, descripcion: true, categoriaNombre: true, marca: true },
      orderBy: [{ categoriaNombre: "asc" }, { descripcion: "asc" }],
    }),
    prisma.fotoProducto.findMany(),
  ]);
  const subidas = new Map(fotos.map((f) => [f.idPos, f.url]));

  const lista: ProductoFoto[] = productos.map((p) => ({
    idPos: p.idPos,
    descripcion: p.descripcion,
    categoria: p.categoriaNombre,
    fotoSubida: subidas.get(p.idPos) ?? null,
    // Foto que la web muestra si no hay una subida (reglas por nombre).
    fotoAutomatica: imagenProducto({ ...p, fotoUrl: null }),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark">Fotos de productos</h1>
      <p className="text-sm text-muted">
        La foto subida reemplaza a la automática y se ve en la web al instante. Se achica y convierte a WebP en tu
        dispositivo antes de subirla.
      </p>
      {!(await blobConfigurado()) && (
        <p className="mt-3 rounded-lg border border-offer/40 bg-card p-3 text-sm">
          Falta conectar <b>Vercel Blob</b> al proyecto (Storage → Blob). Sin eso no se pueden subir fotos.
        </p>
      )}
      <GaleriaFotos productos={lista} />
    </div>
  );
}
