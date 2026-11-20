import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Acceso al módulo /etiquetado con una sola clave (ETIQUETADO_CLAVE). La
// cookie guarda un HMAC derivado de la clave, nunca la clave misma: cambiar
// ETIQUETADO_CLAVE en Vercel invalida todas las sesiones abiertas.
export const COOKIE_SESION = "etq_sesion";
const DURACION_SEGUNDOS = 60 * 60 * 24 * 30;

function claveConfigurada(): string | null {
  const c = process.env.ETIQUETADO_CLAVE;
  return c && c.length >= 8 ? c : null;
}

function token(clave: string): string {
  return createHmac("sha256", clave).update("etiquetado-sesion-v1").digest("hex");
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function moduloConfigurado(): boolean {
  return claveConfigurada() !== null;
}

export async function sesionValida(): Promise<boolean> {
  const clave = claveConfigurada();
  if (!clave) return false;
  const valor = (await cookies()).get(COOKIE_SESION)?.value;
  return !!valor && iguales(valor, token(clave));
}

// Para páginas y Server Actions — toda Server Action debe llamarla, aunque
// la página que la usa ya esté protegida (las acciones son endpoints POST
// públicos por sí mismas).
export async function requerirSesion(): Promise<void> {
  if (!(await sesionValida())) redirect("/etiquetado/ingresar");
}

export async function iniciarSesion(claveIngresada: string): Promise<boolean> {
  const clave = claveConfigurada();
  if (!clave || !iguales(claveIngresada, clave)) return false;
  (await cookies()).set(COOKIE_SESION, token(clave), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/etiquetado",
    maxAge: DURACION_SEGUNDOS,
  });
  return true;
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete({ name: COOKIE_SESION, path: "/etiquetado" });
}
