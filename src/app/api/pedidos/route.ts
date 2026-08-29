import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  plu: z.string().trim().min(1),
  descripcion: z.string().trim().min(1),
  corte: z.string().trim().min(1).nullable(),
  envasado: z.enum(["Tradicional", "Al vacío"]).nullable(),
  instrucciones: z.string().trim().max(300).nullable(),
  cantidad: z.number().positive(),
  unidad: z.enum(["kg", "unidad"]),
  // CLP/kg si unidad es "kg" (cantidad va en gramos) o CLP/unidad si
  // unidad es "unidad" — mismo criterio que ItemCarrito.precio, para que el
  // POS pueda calcular el subtotal de cada item sin tener que ir a buscar
  // el precio actual del catálogo (que puede haber cambiado).
  precioUnitario: z.number().nonnegative(),
});

const bodySchemaBase = z.object({
  clienteNombre: z.string().trim().min(1, "Falta el nombre"),
  clienteTelefono: z.string().trim().min(1, "Falta el teléfono"),
  tipoEntrega: z.enum(["retiro", "despacho"]),
  clienteDireccion: z.string().trim().min(1).nullable(),
  comunaNombre: z.string().trim().min(1).nullable(),
  fechaEntrega: z.string().trim().min(1).nullable(),
  medioPago: z.enum(["Efectivo", "Transferencia", "Tarjeta débito/crédito"]).nullable(),
  items: z.array(itemSchema).min(1, "El pedido no puede estar vacío"),
  comentario: z.string().trim().max(500).optional().nullable(),
});

// Crea la cotización que arma un cliente en la web (despacho o retiro en
// tienda) — no es un pago, solo el detalle que el equipo revisa y confirma
// por WhatsApp. El costo de envío se recalcula acá con el valor real
// guardado para la comuna (nunca se confía en un costoEnvio que mande el
// navegador) — si la comuna no existe en el catálogo sincronizado, o si es
// despacho y falta la dirección/comuna, se rechaza el pedido.
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchemaBase.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  let comunaNombre: string | null = null;
  let costoEnvio: number | null = null;

  if (data.tipoEntrega === "despacho") {
    if (!data.clienteDireccion || !data.comunaNombre) {
      return NextResponse.json({ error: "Falta la dirección o la comuna para el despacho" }, { status: 400 });
    }
    const comuna = await prisma.comuna.findUnique({ where: { nombre: data.comunaNombre } });
    if (!comuna) {
      return NextResponse.json({ error: "No hacemos despacho a esa comuna" }, { status: 400 });
    }
    comunaNombre = comuna.nombre;
    costoEnvio = comuna.costoEnvio;
  }

  const pedido = await prisma.pedido.create({
    data: {
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      tipoEntrega: data.tipoEntrega,
      clienteDireccion: data.tipoEntrega === "despacho" ? data.clienteDireccion : null,
      comunaNombre,
      costoEnvio,
      fechaEntrega: data.fechaEntrega,
      medioPago: data.medioPago,
      itemsJson: JSON.stringify(data.items),
      comentario: data.comentario || null,
    },
  });

  return NextResponse.json({ id: pedido.id, costoEnvio });
}
