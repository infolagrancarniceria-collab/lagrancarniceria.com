import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarSyncKey } from "@/lib/syncAuth";

export const dynamic = "force-dynamic";

// El POS trae de acá los pedidos que todavía no tiene guardados localmente,
// y luego confirma cuáles guardó vía POST /api/sync/pedidos-confirmar (para
// que no se le vuelvan a mandar).
export async function GET(req: NextRequest) {
  const auth = verificarSyncKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const pedidos = await prisma.pedido.findMany({
    where: { entregadoAlPos: false },
    orderBy: { fecha: "asc" },
  });

  return NextResponse.json({
    pedidos: pedidos.map((p) => ({
      idWeb: p.id,
      fecha: p.fecha.toISOString(),
      clienteNombre: p.clienteNombre,
      clienteTelefono: p.clienteTelefono,
      tipoEntrega: p.tipoEntrega,
      clienteDireccion: p.clienteDireccion,
      comunaNombre: p.comunaNombre,
      costoEnvio: p.costoEnvio,
      fechaEntrega: p.fechaEntrega,
      medioPago: p.medioPago,
      items: JSON.parse(p.itemsJson),
      comentario: p.comentario,
    })),
  });
}
