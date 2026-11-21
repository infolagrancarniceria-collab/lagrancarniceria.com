"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";

// Vercel conecta un Blob store con BLOB_READ_WRITE_TOKEN (token clásico) o
// con BLOB_STORE_ID + OIDC (conexiones recientes) — @vercel/blob acepta
// cualquiera de los dos.
export async function blobConfigurado(): Promise<boolean> {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export type ResultadoFoto = { ok: true; url: string | null } | { ok: false; error: string };

const TIPOS = ["image/webp", "image/jpeg", "image/png"];
const MAX_BYTES = 3.5 * 1024 * 1024;

// Borra la foto anterior del almacenamiento — si falla (ej. ya no existía)
// no se interrumpe: la base de datos ya apunta a la nueva.
async function borrarBlob(url: string) {
  try {
    await del(url);
  } catch (err) {
    console.error("[fotos] no se pudo borrar la foto anterior:", err);
  }
}

export async function subirFoto(fd: FormData): Promise<ResultadoFoto> {
  await requerirSesion();
  if (!(await blobConfigurado())) {
    return { ok: false, error: "Falta conectar Vercel Blob al proyecto (Storage → Blob) y redesplegar." };
  }
  const idPos = Number(fd.get("idPos"));
  const archivo = fd.get("foto");
  if (!Number.isInteger(idPos) || !(archivo instanceof File)) return { ok: false, error: "Datos inválidos" };
  if (!TIPOS.includes(archivo.type)) return { ok: false, error: "Formato no soportado (usa JPG, PNG o WebP)" };
  if (archivo.size > MAX_BYTES) return { ok: false, error: "La foto es demasiado pesada" };

  const producto = await prisma.producto.findUnique({ where: { idPos } });
  if (!producto) return { ok: false, error: "El producto ya no existe en el catálogo" };

  const extension = archivo.type.split("/")[1].replace("jpeg", "jpg");
  let blob: Awaited<ReturnType<typeof put>>;
  try {
    blob = await put(`productos/${idPos}-${Date.now()}.${extension}`, archivo, {
      access: "public",
      contentType: archivo.type,
      // La URL cambia con cada subida (timestamp), así que se puede cachear
      // por mucho tiempo sin riesgo de mostrar una foto vieja.
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
  } catch (err) {
    console.error("[fotos] error al subir a Vercel Blob:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Vercel Blob rechazó la subida: ${msg}` };
  }

  const anterior = await prisma.fotoProducto.findUnique({ where: { idPos } });
  await prisma.fotoProducto.upsert({
    where: { idPos },
    create: { idPos, url: blob.url },
    update: { url: blob.url },
  });
  if (anterior) await borrarBlob(anterior.url);

  revalidatePath("/", "layout");
  return { ok: true, url: blob.url };
}

export async function quitarFoto(idPos: number): Promise<ResultadoFoto> {
  await requerirSesion();
  const anterior = await prisma.fotoProducto.findUnique({ where: { idPos } });
  if (anterior) {
    await prisma.fotoProducto.delete({ where: { idPos } });
    await borrarBlob(anterior.url);
  }
  revalidatePath("/", "layout");
  return { ok: true, url: null };
}
