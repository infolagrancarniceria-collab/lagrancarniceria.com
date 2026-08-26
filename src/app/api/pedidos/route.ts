import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  descripcion: z.string().trim().min(1),
  corte: z.string().trim().min(1).nullable(),
  cantidad: z.number().positive(),
  unidad: z.enum(["kg", "unidad"]),
});

const bodySchema = z.object({
  clienteNombre: z.string().trim().min(1, "Falta el nombre"),
  clienteTelefono: z.string().trim().min(1, "Falta el teléfono"),
  clienteDireccion: z.string().trim().min(1, "Falta la dirección"),
  comunaNombre: z.string().trim().min(1, "Falta la comuna"),
  items: z.array(itemSchema).min(1, "El pedido no puede estar vacío"),
  comentario: z.string().trim().max(500).optional().nullable(),
});

// Crea la cotización de despacho que arma un cliente en la web. El costo de
// envío se recalcula acá con el valor real guardado para la comuna (nunca se
// confía en un costoEnvio que mande el navegador) — si la comuna no existe
// en el catálogo sincronizado, se rechaza el pedido.
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  const comuna = await prisma.comuna.findUnique({ where: { nombre: data.comunaNombre } });
  if (!comuna) {
    return NextResponse.json({ error: "No hacemos despacho a esa comuna" }, { status: 400 });
  }

  const pedido = await prisma.pedido.create({
    data: {
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      clienteDireccion: data.clienteDireccion,
      comunaNombre: comuna.nombre,
      costoEnvio: comuna.costoEnvio,
      itemsJson: JSON.stringify(data.items),
      comentario: data.comentario || null,
    },
  });

  return NextResponse.json({ id: pedido.id, costoEnvio: comuna.costoEnvio });
}
