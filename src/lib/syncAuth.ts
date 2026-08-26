import type { NextRequest } from "next/server";

type ResultadoAuth = { ok: true } | { ok: false; status: number; error: string };

// Autenticación de las rutas /api/sync/* — solo el POS debe poder llamarlas,
// usando una llave acotada (nunca la contraseña de la base de datos). Ver
// prisma/schema.prisma para el porqué de este diseño.
export function verificarSyncKey(req: NextRequest): ResultadoAuth {
  const esperado = process.env.SYNC_API_KEY;
  if (!esperado) {
    return { ok: false, status: 503, error: "Sync no configurado en el servidor (falta SYNC_API_KEY)" };
  }
  const recibido = req.headers.get("x-sync-key");
  if (recibido !== esperado) {
    return { ok: false, status: 401, error: "Llave de sync inválida" };
  }
  return { ok: true };
}
