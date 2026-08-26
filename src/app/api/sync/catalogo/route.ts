import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verificarSyncKey } from "@/lib/syncAuth";

export const dynamic = "force-dynamic";

// Este endpoint ya está protegido por la llave de sync (verificarSyncKey) —
// permitir que cualquier origen lo llame (ej. una página HTML local, para
// pruebas manuales) no debilita esa protección, así que el CORS puede ser
// permisivo sin problema.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-sync-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const productoSchema = z.object({
  idPos: z.number().int(),
  plu: z.string(),
  descripcion: z.string(),
  nombreCorto: z.string().nullable(),
  categoriaNombre: z.string(),
  precio: z.number(),
  unidad: z.enum(["kg", "unidad"]),
  familiaCorte: z.string().nullable(),
  agotado: z.boolean(),
});

const bodySchema = z.object({
  // "min(1)" a propósito: un catálogo vacío casi siempre es un bug del lado
  // del POS (ej. sin internet a mitad de armar el snapshot), no un estado
  // real — mejor rechazarlo que vaciar la web sin querer.
  productos: z.array(productoSchema).min(1, "El catálogo no puede llegar vacío"),
  comunas: z.array(z.object({ nombre: z.string(), costoEnvio: z.number() })),
  cortes: z.array(z.object({ familia: z.string(), nombre: z.string(), orden: z.number() })),
});

// Reemplaza el catálogo público completo por el snapshot recibido (no hace
// diffs) — ver prisma/schema.prisma para el porqué de este enfoque.
export async function POST(req: NextRequest) {
  const auth = verificarSyncKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: CORS_HEADERS });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400, headers: CORS_HEADERS });
  }
  const { productos, comunas, cortes } = parsed.data;

  await prisma.$transaction([
    prisma.producto.deleteMany(),
    prisma.producto.createMany({ data: productos }),
    prisma.comuna.deleteMany(),
    prisma.comuna.createMany({ data: comunas }),
    prisma.corteOpcion.deleteMany(),
    prisma.corteOpcion.createMany({ data: cortes }),
  ]);

  return NextResponse.json(
    {
      ok: true,
      recibidos: { productos: productos.length, comunas: comunas.length, cortes: cortes.length },
    },
    { headers: CORS_HEADERS }
  );
}
