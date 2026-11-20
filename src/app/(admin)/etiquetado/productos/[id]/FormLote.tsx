"use client";

import { useActionState } from "react";
import { guardarLote, type EstadoForm } from "../../acciones";

const input = "rounded-lg border border-card-border bg-white px-3 py-2";

export default function FormLote({ productoId, kgBase }: { productoId: number; kgBase: number }) {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(guardarLote, { error: null });
  const hoy = new Date().toISOString().slice(0, 10);
  return (
    <form action={accion} className="mt-3 grid gap-3 rounded-xl border border-card-border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6">
      <input type="hidden" name="productoId" value={productoId} />
      <label className="flex flex-col gap-1 text-sm">
        Código de lote
        <input name="codigo" required className={input} placeholder="ej. L2611-01" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Elaboración
        <input name="fechaElaboracion" type="date" required defaultValue={hoy} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Vencimiento (opcional)
        <input name="fechaVencimiento" type="date" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Peso antes del proceso (kg)
        <input name="pesoAntesG" required inputMode="decimal" className={input} placeholder={`ej. ${kgBase}`} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Peso final (kg)
        <input name="pesoFinalG" required inputMode="decimal" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notas
        <input name="notas" className={input} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-3 lg:col-span-6">
        <button disabled={pendiente} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background disabled:opacity-60">
          {pendiente ? "Guardando…" : "Registrar lote"}
        </button>
        <span className="text-xs text-muted">Si no indicas vencimiento, se calcula con la vida útil del producto.</span>
        {estado.error && <span className="text-sm text-offer">{estado.error}</span>}
        {estado.ok && <span className="text-sm text-dark">{estado.ok}</span>}
      </div>
    </form>
  );
}
