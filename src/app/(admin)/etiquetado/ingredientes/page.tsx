import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { formatoEntero, formatoG } from "@/lib/etiquetado/calculo";

export default async function IngredientesPage() {
  await requerirSesion();
  const ingredientes = await prisma.ingredienteNutricional.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { itemsReceta: true } } },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark">Ingredientes</h1>
          <p className="text-sm text-muted">Valores por 100 g. Fuente por defecto: USDA FoodData Central (Anexo 1 del manual).</p>
        </div>
        <Link href="/etiquetado/ingredientes/nuevo" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background">
          + Nuevo ingrediente
        </Link>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-card-border bg-card">
        <table className="w-full text-sm tabular">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-3 py-2">Ingrediente</th>
              <th className="px-2 py-2 text-right">kcal</th>
              <th className="px-2 py-2 text-right">Prot.</th>
              <th className="px-2 py-2 text-right">Grasa</th>
              <th className="px-2 py-2 text-right">Sat.</th>
              <th className="px-2 py-2 text-right">HC disp.</th>
              <th className="px-2 py-2 text-right">Azúc.</th>
              <th className="px-2 py-2 text-right">Sodio mg</th>
              <th className="px-3 py-2">Adiciona</th>
              <th className="px-3 py-2 text-right">Recetas</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((i) => (
              <tr key={i.id} className="border-t border-card-border">
                <td className="px-3 py-2">
                  <Link href={`/etiquetado/ingredientes/${i.id}`} className="font-semibold text-accent underline-offset-2 hover:underline">
                    {i.nombre}
                  </Link>
                  <div className="text-xs text-muted">{i.fuente}</div>
                </td>
                <td className="px-2 py-2 text-right">{formatoEntero(i.energiaKcal)}</td>
                <td className="px-2 py-2 text-right">{formatoG(i.proteinasG)}</td>
                <td className="px-2 py-2 text-right">{formatoG(i.grasaTotalG)}</td>
                <td className="px-2 py-2 text-right">{formatoG(i.grasaSatG)}</td>
                <td className="px-2 py-2 text-right">{formatoG(i.hcDispG)}</td>
                <td className="px-2 py-2 text-right">{formatoG(i.azucaresG)}</td>
                <td className="px-2 py-2 text-right">{formatoEntero(i.sodioMg)}</td>
                <td className="px-3 py-2 text-xs">
                  {[i.adicionaSodio && "sodio", i.adicionaAzucares && "azúcares", i.adicionaGrasas && "grasas"].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-3 py-2 text-right">{i._count.itemsReceta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
