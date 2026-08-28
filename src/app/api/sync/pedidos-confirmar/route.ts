import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verificarSyncKey } from "@/lib/syncAuth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ idsWeb: z.array(z.string()).min(1) });

export async function POST(req: NextRequest) {
  const auth = verificarSyncKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await prisma.pedido.updateMany({
    where: { id: { in: parsed.data.idsWeb } },
    data: { entregadoAlPos: true, entregadoAlPosEn: new Date() },
  });

  return NextResponse.json({ ok: true });
}
