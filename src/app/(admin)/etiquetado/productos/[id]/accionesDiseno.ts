"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { leerPosiciones } from "@/lib/etiquetado/diseno";

export type ResultadoDiseno = { ok: true; url: string | null } | { ok: false; error: string };

const TIPOS = ["image/webp", "image/jpeg", "image/png"];
const MAX_BYTES = 3.5 * 1024 * 1024;

async function borrarBlob(url: string) {
  try {
    await del(url);
  } catch (err) {
    console.error("[diseño] no se pudo borrar el diseño anterior:", err);
  }
}

export async function subirDiseno(fd: FormData): Promise<ResultadoDiseno> {
  await requerirSesion();
  if (!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)) {
    return { ok: false, error: "Falta conectar Vercel Blob al proyecto (Storage → Blob) y redesplegar." };
  }
  const productoId = Number(fd.get("productoId"));
  const archivo = fd.get("diseno");
  if (!Number.isInteger(productoId) || !(archivo instanceof File)) return { ok: false, error: "Datos inválidos" };
  if (!TIPOS.includes(archivo.type)) return { ok: false, error: "Formato no soportado (usa PNG, JPG o WebP)" };
  if (archivo.size > MAX_BYTES) return { ok: false, error: "El diseño es demasiado pesado" };
  const producto = await prisma.productoArtesanal.findUnique({ where: { id: productoId } });
  if (!producto) return { ok: false, error: "El producto ya no existe" };

  const ext = archivo.type.split("/")[1].replace("jpeg", "jpg");
  let url: string;
  try {
    const blob = await put(`etiquetas/${productoId}-${Date.now()}.${ext}`, archivo, {
      access: "public",
      contentType: archivo.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    url = blob.url;
  } catch (err) {
    console.error("[diseño] error al subir a Vercel Blob:", err);
    return { ok: false, error: `Vercel Blob rechazó la subida: ${err instanceof Error ? err.message : String(err)}` };
  }
  await prisma.productoArtesanal.update({ where: { id: productoId }, data: { disenoFrontalUrl: url } });
  if (producto.disenoFrontalUrl) await borrarBlob(producto.disenoFrontalUrl);
  revalidatePath(`/etiquetado/productos/${productoId}`);
  return { ok: true, url };
}

export async function quitarDiseno(productoId: number): Promise<ResultadoDiseno> {
  await requerirSesion();
  const producto = await prisma.productoArtesanal.findUnique({ where: { id: productoId } });
  if (producto?.disenoFrontalUrl) {
    await prisma.productoArtesanal.update({ where: { id: productoId }, data: { disenoFrontalUrl: null } });
    await borrarBlob(producto.disenoFrontalUrl);
  }
  revalidatePath(`/etiquetado/productos/${productoId}`);
  return { ok: true, url: null };
}

export async function guardarPosiciones(productoId: number, json: string): Promise<{ ok: boolean }> {
  await requerirSesion();
  // Se normaliza (descarta valores fuera de rango o campos desconocidos).
  const limpio = JSON.stringify(leerPosiciones(json));
  await prisma.productoArtesanal.update({ where: { id: productoId }, data: { disenoCampos: limpio } });
  revalidatePath(`/etiquetado/productos/${productoId}`);
  return { ok: true };
}
