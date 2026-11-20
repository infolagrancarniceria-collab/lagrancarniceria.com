"use client";

import { useState } from "react";
import type { EtiquetaPublica } from "@/lib/etiquetado/datos";
import TablaNutricional from "@/components/etiquetado/TablaNutricional";
import SelloAltoEn from "@/components/etiquetado/SelloAltoEn";

// Información nutricional de un producto artesanal en la ficha pública
// (modal del cotizador) — calculada en /etiquetado con la merma del último
// lote. Colapsada por defecto para no alargar el cotizador.
export default function InfoNutricional({ etiqueta }: { etiqueta: EtiquetaPublica }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-card-border bg-surface">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-dark"
      >
        <span className="flex items-center gap-2">
          Información nutricional
          {etiqueta.sellos.length > 0 && (
            <span className="flex gap-1">
              {etiqueta.sellos.map((s) => (
                <SelloAltoEn key={s} sello={s} tamano="26px" />
              ))}
            </span>
          )}
        </span>
        <span className="text-muted">{abierta ? "−" : "+"}</span>
      </button>
      {abierta && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {etiqueta.sellos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {etiqueta.sellos.map((s) => (
                <SelloAltoEn key={s} sello={s} tamano="64px" />
              ))}
            </div>
          )}
          <TablaNutricional
            porcionG={etiqueta.porcionG}
            porcionMedidaCasera={etiqueta.porcionMedidaCasera}
            porcionesEnvase={null}
            por100={etiqueta.por100}
            porPorcion={etiqueta.porPorcion}
            desglosarGrasas={etiqueta.desglosarGrasas}
            escala={1.35}
          />
          <p className="text-xs text-text">
            <b>Ingredientes:</b> {etiqueta.ingredientes}
          </p>
        </div>
      )}
    </div>
  );
}
