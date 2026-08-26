"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatoCLP } from "@/lib/format";

interface Props {
  idPos: number;
  descripcion: string;
  precio: number;
  unidad: "kg" | "unidad";
  agotado: boolean;
  opcionesCorte: string[];
}

export default function ProductoFila({ idPos, descripcion, precio, unidad, agotado, opcionesCorte }: Props) {
  const { agregar } = useCart();
  const [corte, setCorte] = useState(opcionesCorte[0] ?? "");
  const [cantidad, setCantidad] = useState(unidad === "kg" ? "1" : "1");
  const [agregado, setAgregado] = useState(false);

  function handleAgregar() {
    const cantidadNum = Number(cantidad);
    if (!cantidadNum || cantidadNum <= 0) return;
    agregar(
      {
        idPos,
        descripcion,
        precio,
        unidad,
        corte: opcionesCorte.length > 0 ? corte : null,
      },
      cantidadNum
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  }

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">
          {descripcion}
          {agotado && (
            <span className="ml-2 rounded-full bg-danger/20 px-2 py-0.5 text-xs font-medium text-danger">
              Agotado
            </span>
          )}
        </p>
        <p className="font-display text-lg font-semibold text-accent">
          {formatoCLP(precio)}
          <span className="ml-1 text-sm font-normal text-muted">/{unidad === "kg" ? "kg" : "un."}</span>
        </p>
      </div>

      {!agotado && (
        <div className="flex flex-wrap items-center gap-2">
          {opcionesCorte.length > 0 && (
            <select
              value={corte}
              onChange={(e) => setCorte(e.target.value)}
              className="rounded-md border border-surface-border bg-background px-2 py-1.5 text-sm"
              aria-label={`Corte para ${descripcion}`}
            >
              {opcionesCorte.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <input
            type="number"
            min="0"
            step={unidad === "kg" ? "0.5" : "1"}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-20 rounded-md border border-surface-border bg-background px-2 py-1.5 text-sm"
            aria-label={`Cantidad en ${unidad === "kg" ? "kilos" : "unidades"} de ${descripcion}`}
          />
          <span className="text-xs text-muted">{unidad === "kg" ? "kg" : "un."}</span>
          <button
            type="button"
            onClick={handleAgregar}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background hover:bg-accent-strong"
          >
            {agregado ? "Agregado ✓" : "Agregar"}
          </button>
        </div>
      )}
    </li>
  );
}
