"use client";

import { useActionState } from "react";
import type { IngredienteNutricional } from "@prisma/client";
import { guardarIngrediente, type EstadoForm } from "../../acciones";

const CAMPOS: { name: keyof IngredienteNutricional; label: string }[] = [
  { name: "energiaKcal", label: "Energía (kcal)" },
  { name: "proteinasG", label: "Proteínas (g)" },
  { name: "grasaTotalG", label: "Grasa total (g)" },
  { name: "grasaSatG", label: "Grasa saturada (g)" },
  { name: "grasaMonoG", label: "Grasa monoinsat. (g)" },
  { name: "grasaPoliG", label: "Grasa poliinsat. (g)" },
  { name: "grasaTransG", label: "Grasa trans (g)" },
  { name: "colesterolMg", label: "Colesterol (mg)" },
  { name: "hcDispG", label: "H. de C. disponibles (g)" },
  { name: "azucaresG", label: "Azúcares totales (g)" },
  { name: "sodioMg", label: "Sodio (mg)" },
];

const input = "rounded-lg border border-card-border bg-white px-3 py-2";

export default function FormIngrediente({ ing }: { ing: IngredienteNutricional | null }) {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(guardarIngrediente, { error: null });
  const v = (k: keyof IngredienteNutricional) => {
    const x = ing?.[k];
    return x == null ? "" : String(x);
  };
  return (
    <form action={accion} className="mt-4 flex flex-col gap-5">
      <input type="hidden" name="id" value={ing?.id ?? ""} />
      <fieldset className="grid gap-3 rounded-xl border border-card-border bg-card p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Nombre interno
          <input name="nombre" defaultValue={v("nombre")} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nombre en el listado de ingredientes del rótulo
          <input name="nombreRotulo" defaultValue={v("nombreRotulo")} required className={input} placeholder="ej. carne de cerdo" />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Fuente de los valores
          <input name="fuente" defaultValue={v("fuente")} required className={input} placeholder="ej. USDA FDC 167843 / ficha técnica proveedor" />
        </label>
      </fieldset>

      <fieldset className="rounded-xl border border-card-border bg-card p-4">
        <legend className="px-1 text-sm font-bold text-dark">Composición por 100 g</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CAMPOS.map((c) => (
            <label key={c.name} className="flex flex-col gap-1 text-sm">
              {c.label}
              <input name={c.name} defaultValue={v(c.name)} required inputMode="decimal" className={`${input} tabular`} />
            </label>
          ))}
        </div>
        <label className="mt-3 flex max-w-xs flex-col gap-1 text-sm">
          Agua (g) — opcional
          <input name="aguaG" defaultValue={v("aguaG")} inputMode="decimal" className={`${input} tabular`} />
          <span className="text-xs text-muted">Necesaria para el modelo de salmuera. Vacío = se estima por diferencia.</span>
        </label>
        <p className="mt-2 text-xs text-muted">
          H. de C. disponibles = hidratos de carbono totales − fibra dietética. Acepta coma o punto decimal.
        </p>
      </fieldset>

      <fieldset className="rounded-xl border border-card-border bg-card p-4">
        <legend className="px-1 text-sm font-bold text-dark">Adición de nutrientes críticos (Anexo 2)</legend>
        <p className="mb-2 text-xs text-muted">
          Marca si agregar este ingrediente cuenta como &quot;adición&quot;. Sin adición, el sello no corresponde aunque se supere el límite.
        </p>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="adicionaSodio" defaultChecked={ing?.adicionaSodio} /> Sodio (sal, aditivos con sodio)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="adicionaAzucares" defaultChecked={ing?.adicionaAzucares} /> Azúcares (azúcar, miel, jarabes)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="adicionaGrasas" defaultChecked={ing?.adicionaGrasas} /> Grasas (aceites, mantecas, grasa animal)
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-xl border border-card-border bg-card p-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Densidad (g/ml) — si se mide en ml
          <input name="densidadGMl" defaultValue={v("densidadGMl") || "1"} required inputMode="decimal" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Peso por unidad (g) — si se mide en unidades
          <input name="pesoUnidadG" defaultValue={v("pesoUnidadG")} inputMode="decimal" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Alérgenos (separados por coma)
          <input name="alergeno" defaultValue={v("alergeno")} className={input} placeholder="ej. leche, soya" />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-3">
          Notas
          <textarea name="notas" defaultValue={v("notas")} rows={2} className={input} />
        </label>
      </fieldset>

      {estado.error && <p className="text-sm text-offer">{estado.error}</p>}
      <button disabled={pendiente} className="self-start rounded-lg bg-accent px-5 py-2 font-bold text-background disabled:opacity-60">
        {pendiente ? "Guardando…" : "Guardar ingrediente"}
      </button>
    </form>
  );
}
