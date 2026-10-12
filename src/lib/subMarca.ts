// "La Gran Charcutería" — acento visual distintivo sobre la categoría real
// "Artesanales" (dorado en vez del burdeo del resto del sitio), a pedido
// del usuario para diferenciar la línea artesanal sin crear una sección,
// ruta ni filtro aparte: sigue siendo la misma categoría del catálogo,
// solo se le cambia cómo se ve.
//
// Comparación normalizada (sin tildes/mayúsculas/espacios extra) y no con
// "===" tal cual — el nombre real de la categoría en el POS no siempre
// calza textualmente con lo que se supone acá (ver mismo problema con
// "Pollo"/"Aves" en Catalogo.tsx).
function normalizarCategoria(c: string): string {
  return c
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function esArtesanal(categoriaNombre: string): boolean {
  return normalizarCategoria(categoriaNombre) === "artesanales";
}

export function nombreVisible(categoriaNombre: string): string {
  return esArtesanal(categoriaNombre) ? "La Gran Charcutería" : categoriaNombre;
}
