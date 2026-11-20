"use client";

import { useActionState } from "react";
import type { DatosRotulo } from "@prisma/client";
import { guardarDatosRotulo, type EstadoForm } from "../acciones";

const input = "rounded-lg border border-card-border bg-white px-3 py-2";

export default function FormEmpresa({ datos }: { datos: DatosRotulo | null }) {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(guardarDatosRotulo, { error: null });
  return (
    <form action={accion} className="mt-4 flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4">
      <label className="flex flex-col gap-1 text-sm">
        Nombre o razón social del fabricante
        <input name="razonSocial" defaultValue={datos?.razonSocial} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Domicilio (con comuna)
        <input name="domicilio" defaultValue={datos?.domicilio} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Resolución sanitaria (número, fecha y servicio que la emite)
        <textarea name="resolucionSanitaria" defaultValue={datos?.resolucionSanitaria} required rows={3} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        País de origen
        <input name="paisOrigen" defaultValue={datos?.paisOrigen ?? "Chile"} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contacto (opcional)
        <input name="contacto" defaultValue={datos?.contacto ?? ""} className={input} placeholder="ej. +56 9 ... / @instagram" />
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pendiente} className="rounded-lg bg-accent px-5 py-2 font-bold text-background disabled:opacity-60">
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        {estado.error && <span className="text-sm text-offer">{estado.error}</span>}
        {estado.ok && <span className="text-sm text-dark">{estado.ok}</span>}
      </div>
    </form>
  );
}
