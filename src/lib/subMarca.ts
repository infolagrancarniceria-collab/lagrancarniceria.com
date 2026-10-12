// "La Gran Charcutería" — acento visual distintivo sobre la categoría real
// "Artesanales" (dorado en vez del burdeo del resto del sitio), a pedido
// del usuario para diferenciar la línea artesanal sin crear una sección,
// ruta ni filtro aparte: sigue siendo la misma categoría del catálogo,
// solo se le cambia cómo se ve.
export function esArtesanal(categoriaNombre: string): boolean {
  return categoriaNombre === "Artesanales";
}

export function nombreVisible(categoriaNombre: string): string {
  return esArtesanal(categoriaNombre) ? "La Gran Charcutería" : categoriaNombre;
}
