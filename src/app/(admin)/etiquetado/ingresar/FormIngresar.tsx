"use client";

import { useActionState } from "react";
import { ingresar, type EstadoForm } from "../acciones";

export default function FormIngresar() {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(ingresar, { error: null });
  return (
    <form action={accion} className="mt-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Clave
        <input name="clave" type="password" required autoFocus className="rounded-lg border border-card-border px-3 py-2" />
      </label>
      {estado.error && <p className="text-sm text-offer">{estado.error}</p>}
      <button disabled={pendiente} className="rounded-lg bg-accent px-4 py-2 font-bold text-background disabled:opacity-60">
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
