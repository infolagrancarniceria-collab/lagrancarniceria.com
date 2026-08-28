import type { ProductoPublico } from "./types";

export interface Badge {
  texto: string;
  fondo: string;
  color: string;
  borde?: string;
}

// Prioridad cuando varias condiciones aplican a la vez — solo se muestra un
// badge por tarjeta (sección 4 del prompt de diseño: "esquina superior
// izquierda de la foto").
export function badgeProducto(p: ProductoPublico): Badge | null {
  if (p.disponibilidad === "agotado") {
    return { texto: "Agotado", fondo: "var(--dark)", color: "var(--background)" };
  }
  if (p.disponibilidad === "proximamente") {
    return { texto: "Próximamente", fondo: "var(--gold)", color: "var(--dark)" };
  }
  if (p.lowStock) {
    return { texto: "Pocas unidades", fondo: "#ffffff", color: "var(--accent)", borde: "var(--accent)" };
  }
  if (p.promoPrecioUnitario != null) {
    return { texto: "Oferta", fondo: "var(--offer)", color: "var(--background)" };
  }
  return null;
}

export function tienePromoActiva(p: ProductoPublico): boolean {
  return p.promoPrecioUnitario != null && p.promoGramosMinimos != null;
}
