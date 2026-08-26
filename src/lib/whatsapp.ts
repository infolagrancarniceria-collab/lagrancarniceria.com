import type { ItemCarrito } from "./cart";
import { formatoCLP, formatoPeso } from "./format";
import { subtotalItem, totalCarrito } from "./pricing";
import type { MedioPago, TipoEntrega } from "./types";

export const WHATSAPP_NUMERO = "56991508931";

export interface DatosConfirmacion {
  clienteNombre: string;
  clienteTelefono: string;
  tipoEntrega: TipoEntrega;
  comunaNombre: string | null;
  clienteDireccion: string | null;
  costoEnvio: number | null;
  fechaEntrega: string | null;
  medioPago: MedioPago | null;
  comentario: string;
}

function lineaItem(item: ItemCarrito): string {
  const cantidad = item.unidad === "kg" ? formatoPeso(item.cantidad) : `${item.cantidad} un.`;
  const detalle = [item.corte, item.envasado].filter(Boolean).join(" · ");
  const partes = [`• ${item.descripcion} (PLU ${item.plu}) — ${cantidad}`];
  if (detalle) partes.push(`  ${detalle}`);
  if (item.instrucciones) partes.push(`  Instrucciones: ${item.instrucciones}`);
  partes.push(`  Subtotal: ${formatoCLP(subtotalItem(item))}`);
  return partes.join("\n");
}

// Mensaje de texto plano con el detalle completo del pedido — el mismo
// texto se usa para el link de wa.me (sección 8 del prompt de diseño). No
// hay envío paralelo a Google Sheets: el pedido queda guardado en nuestra
// base compartida con el POS (ver /api/pedidos), que es lo que decidimos
// mantener en vez del flujo estático original del prompt.
export function construirMensajePedido(items: ItemCarrito[], datos: DatosConfirmacion): string {
  const lineas: string[] = [];
  lineas.push("Pedido — La Gran Carnicería");
  lineas.push("");
  lineas.push(...items.map(lineaItem));
  lineas.push("");

  const total = totalCarrito(items);
  const totalConEnvio = total + (datos.costoEnvio ?? 0);

  if (datos.tipoEntrega === "despacho") {
    lineas.push(`Costo de envío: ${datos.costoEnvio ? formatoCLP(datos.costoEnvio) : "Gratis"}`);
  }
  lineas.push(`Total: ${formatoCLP(totalConEnvio)}`);
  lineas.push("");

  lineas.push(`Tipo de entrega: ${datos.tipoEntrega === "despacho" ? "Despacho a domicilio" : "Retiro en tienda"}`);
  if (datos.fechaEntrega) lineas.push(`Fecha de entrega: ${datos.fechaEntrega}`);
  if (datos.tipoEntrega === "despacho") {
    lineas.push(`Comuna: ${datos.comunaNombre}`);
    lineas.push(`Dirección: ${datos.clienteDireccion}`);
  }
  lineas.push("");

  lineas.push(`Nombre: ${datos.clienteNombre}`);
  lineas.push(`Teléfono: ${datos.clienteTelefono}`);
  if (datos.medioPago) lineas.push(`Medio de pago: ${datos.medioPago}`);
  if (datos.comentario) lineas.push(`Observaciones: ${datos.comentario}`);

  return lineas.join("\n");
}

export function linkWhatsapp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
