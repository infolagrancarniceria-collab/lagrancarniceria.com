"use client";

import Image from "next/image";
import { badgeProducto } from "@/lib/badges";
import { formatoCLP } from "@/lib/format";
import { imagenProducto } from "@/lib/imagenesProductos";
import { useUi } from "@/lib/ui";
import type { ProductoPublico } from "@/lib/types";

export default function ProductoCard({ producto }: { producto: ProductoPublico }) {
  const { abrirCotizador } = useUi();
  const badge = badgeProducto(producto);
  const deshabilitado = producto.disponibilidad !== "disponible";
  const foto = imagenProducto(producto);

  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl bg-card transition-transform duration-300 hover:-translate-y-0.5"
      style={{ border: "1px solid var(--card-border)", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}
    >
      <div className="relative aspect-[4/5] w-full" style={{ background: "var(--surface)" }}>
        {foto && (
          <Image
            src={foto}
            alt={producto.descripcion}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain"
          />
        )}
        {badge && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: badge.fondo,
              color: badge.color,
              border: badge.borde ? `1px solid ${badge.borde}` : undefined,
            }}
          >
            {badge.texto}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{producto.categoriaNombre}</p>
        <h3 className="font-display text-lg leading-snug text-dark">{producto.descripcion}</h3>
        {producto.marca && <p className="text-sm font-bold text-accent">{producto.marca}</p>}
        {producto.descripcionCorta && <p className="text-sm text-muted">{producto.descripcionCorta}</p>}
        {producto.promoEtiqueta && (
          <p className="text-sm font-semibold" style={{ color: "var(--offer)" }}>
            {producto.promoEtiqueta}
          </p>
        )}

        <p className="tabular mt-2 font-sans text-2xl font-bold text-accent">
          {formatoCLP(producto.precio)}
          <span className="ml-1 text-sm font-normal text-muted">
            {producto.unidad === "kg" ? "por kilo" : "por unidad"}
          </span>
        </p>

        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => abrirCotizador(producto)}
          className="mt-3 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-300 disabled:cursor-not-allowed"
          style={
            deshabilitado
              ? { background: "var(--surface)", color: "var(--muted)" }
              : { background: "var(--accent)", color: "var(--background)" }
          }
        >
          {producto.disponibilidad === "agotado"
            ? "Agotado"
            : producto.disponibilidad === "proximamente"
              ? "Próximamente"
              : "Cotizar"}
        </button>
      </div>
    </article>
  );
}
