import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { eliminarIngrediente } from "../../acciones";
import FormIngrediente from "./FormIngrediente";

export default async function IngredientePage({ params, searchParams }: PageProps<"/etiquetado/ingredientes/[id]">) {
  await requerirSesion();
  const { id } = await params;
  const { error } = await searchParams;
  const ing = id === "nuevo" ? null : await prisma.ingredienteNutricional.findUnique({ where: { id: Number(id) || 0 } });
  if (id !== "nuevo" && !ing) notFound();
  const usos = ing ? await prisma.recetaItem.count({ where: { ingredienteId: ing.id } }) : 0;

  return (
    <div className="max-w-3xl">
      <Link href="/etiquetado/ingredientes" className="text-sm text-accent">
        ← Ingredientes
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-dark">{ing ? ing.nombre : "Nuevo ingrediente"}</h1>
      {error === "en-uso" && (
        <p className="mt-3 rounded-lg bg-card p-3 text-sm text-offer">No se puede eliminar: se usa en {usos} receta(s).</p>
      )}
      <FormIngrediente ing={ing} />
      {ing && usos === 0 && (
        <form action={eliminarIngrediente} className="mt-6">
          <input type="hidden" name="id" value={ing.id} />
          <button className="text-sm text-offer underline">Eliminar ingrediente</button>
        </form>
      )}
    </div>
  );
}
