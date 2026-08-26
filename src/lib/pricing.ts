import type { ItemCarrito } from "./cart";

// item.precio es CLP/kg cuando unidad es "kg" (cantidad va en gramos) o
// CLP/unidad cuando unidad es "unidad" (cantidad va en unidades).
export function subtotalItem(item: ItemCarrito): number {
  return item.unidad === "kg" ? Math.round((item.precio * item.cantidad) / 1000) : item.precio * item.cantidad;
}

export function totalCarrito(items: ItemCarrito[]): number {
  return items.reduce((acc, i) => acc + subtotalItem(i), 0);
}
