"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cerrarSesion, iniciarSesion, requerirSesion } from "@/lib/etiquetado/auth";
import { MERMA_MAXIMA } from "@/lib/etiquetado/calculo";

export type EstadoForm = { error: string | null; ok?: string | null };

// Números escritos a la chilena ("2,5") o con punto ("2.5").
function aNumero(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (s === "") return NaN;
  return Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
}
const num = z.preprocess(aNumero, z.number({ invalid_type_error: "Hay un número inválido" }).finite());
const numNoNeg = num.pipe(z.number().nonnegative("Los valores no pueden ser negativos"));
const numOpcional = z.preprocess((v) => (v === "" || v == null ? null : v), numNoNeg.nullable());
const texto = z.string().trim();
const textoOpcional = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), texto.nullable());
const check = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .transform((s) => new Date(`${s}T00:00:00Z`));

function primerError(e: z.ZodError): string {
  const i = e.issues[0];
  return i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message;
}

// ---------------------------------------------------------------- sesión

export async function ingresar(_prev: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const ok = await iniciarSesion(String(fd.get("clave") ?? ""));
  if (!ok) return { error: "Clave incorrecta" };
  redirect("/etiquetado");
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/etiquetado/ingresar");
}

// ---------------------------------------------------------------- ingredientes

const ingredienteSchema = z.object({
  nombre: texto.min(1, "Falta el nombre"),
  nombreRotulo: texto.min(1, "Falta el nombre en el rótulo"),
  fuente: texto.min(1, "Indica la fuente de los valores"),
  notas: textoOpcional,
  energiaKcal: numNoNeg,
  proteinasG: numNoNeg,
  grasaTotalG: numNoNeg,
  grasaSatG: numNoNeg,
  grasaMonoG: numNoNeg,
  grasaPoliG: numNoNeg,
  grasaTransG: numNoNeg,
  colesterolMg: numNoNeg,
  hcDispG: numNoNeg,
  azucaresG: numNoNeg,
  sodioMg: numNoNeg,
  adicionaSodio: check,
  adicionaAzucares: check,
  adicionaGrasas: check,
  densidadGMl: num.pipe(z.number().positive("La densidad debe ser mayor a 0")),
  pesoUnidadG: numOpcional,
  alergeno: textoOpcional,
});

export async function guardarIngrediente(_prev: EstadoForm, fd: FormData): Promise<EstadoForm> {
  await requerirSesion();
  const id = Number(fd.get("id")) || null;
  const datos = Object.fromEntries(fd.entries());
  const parsed = ingredienteSchema.safeParse(datos);
  if (!parsed.success) return { error: primerError(parsed.error) };
  const d = parsed.data;
  if (d.grasaSatG + d.grasaMonoG + d.grasaPoliG + d.grasaTransG > d.grasaTotalG * 1.05 + 0.1) {
    return { error: "La suma de grasas saturadas, mono, poli y trans supera la grasa total" };
  }
  if (d.azucaresG > d.hcDispG + 0.05 && d.hcDispG > 0) {
    return { error: "Los azúcares no pueden superar los hidratos de carbono disponibles" };
  }
  try {
    if (id) await prisma.ingredienteNutricional.update({ where: { id }, data: d });
    else await prisma.ingredienteNutricional.create({ data: d });
  } catch {
    return { error: "Ya existe un ingrediente con ese nombre" };
  }
  revalidatePath("/etiquetado", "layout");
  redirect("/etiquetado/ingredientes");
}

export async function eliminarIngrediente(fd: FormData): Promise<void> {
  await requerirSesion();
  const id = Number(fd.get("id"));
  const usos = await prisma.recetaItem.count({ where: { ingredienteId: id } });
  if (usos > 0) redirect(`/etiquetado/ingredientes/${id}?error=en-uso`);
  await prisma.ingredienteNutricional.delete({ where: { id } });
  revalidatePath("/etiquetado", "layout");
  redirect("/etiquetado/ingredientes");
}

// ---------------------------------------------------------------- productos

const itemSchema = z.object({
  ingredienteId: z.number().int().positive(),
  cantidad: z.number().finite().positive("Las cantidades deben ser mayores a 0"),
  unidad: z.enum(["g", "kg", "ml", "l", "unidad"]),
  porKgBase: z.boolean(),
  enSalmuera: z.boolean().default(false),
});

const productoSchema = z.object({
  nombre: texto.min(1, "Falta el nombre del producto"),
  kgBase: num.pipe(z.number().positive("Los kg de base deben ser mayores a 0")),
  mermaPct: num.pipe(z.number().min(0).max(90, "La merma no puede superar 90 %")),
  salmueraAbsorbidaPct: numOpcional,
  porcionG: num.pipe(z.number().positive("La porción debe ser mayor a 0")),
  porcionMedidaCasera: texto.min(1, "Falta la porción en medida casera (ej. 1 unidad)"),
  vidaUtilDias: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().positive().nullable()),
  almacenamiento: textoOpcional,
  instruccionesUso: textoOpcional,
  leyendaAdicional: textoOpcional,
  etiquetaAnchoCm: numOpcional,
  etiquetaAltoCm: numOpcional,
  idPosWeb: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().nullable()),
  publicarEnWeb: check,
  items: z.preprocess(
    (v) => {
      try {
        return JSON.parse(String(v));
      } catch {
        return null;
      }
    },
    z.array(itemSchema).min(1, "La receta necesita al menos un ingrediente")
  ),
});

export async function guardarProducto(_prev: EstadoForm, fd: FormData): Promise<EstadoForm> {
  await requerirSesion();
  const id = Number(fd.get("id")) || null;
  const parsed = productoSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: primerError(parsed.error) };
  const { items, ...d } = parsed.data;
  if (d.publicarEnWeb && d.idPosWeb == null) return { error: "Para publicar en la web, elige el producto del catálogo" };

  const filas = items.map((it, orden) => ({ ...it, orden }));
  let nuevoId = id;
  try {
    if (id) {
      await prisma.$transaction([
        prisma.recetaItem.deleteMany({ where: { productoId: id } }),
        prisma.productoArtesanal.update({ where: { id }, data: { ...d, items: { create: filas } } }),
      ]);
    } else {
      const creado = await prisma.productoArtesanal.create({ data: { ...d, items: { create: filas } } });
      nuevoId = creado.id;
    }
  } catch {
    return { error: "Ya existe un producto con ese nombre" };
  }
  revalidatePath("/", "layout");
  revalidatePath("/etiquetado", "layout");
  if (!id) redirect(`/etiquetado/productos/${nuevoId}`);
  return { error: null, ok: "Guardado" };
}

export async function eliminarProducto(fd: FormData): Promise<void> {
  await requerirSesion();
  await prisma.productoArtesanal.delete({ where: { id: Number(fd.get("id")) } });
  revalidatePath("/", "layout");
  redirect("/etiquetado");
}

// ---------------------------------------------------------------- lotes

const loteSchema = z.object({
  productoId: z.coerce.number().int().positive(),
  codigo: texto.min(1, "Falta el código de lote"),
  fechaElaboracion: fecha,
  fechaVencimiento: z.preprocess((v) => (v === "" || v == null ? null : v), fecha.nullable()),
  pesoAntesG: num.pipe(z.number().positive("El peso antes del proceso debe ser mayor a 0")),
  pesoFinalG: num.pipe(z.number().positive("El peso final debe ser mayor a 0")),
  notas: textoOpcional,
});

export async function guardarLote(_prev: EstadoForm, fd: FormData): Promise<EstadoForm> {
  await requerirSesion();
  // Los pesos se ingresan en kg (como se pesa en la sala de proceso).
  const crudo = Object.fromEntries(fd.entries());
  const parsed = loteSchema.safeParse(crudo);
  if (!parsed.success) return { error: primerError(parsed.error) };
  const d = { ...parsed.data, pesoAntesG: parsed.data.pesoAntesG * 1000, pesoFinalG: parsed.data.pesoFinalG * 1000 };
  if (d.pesoFinalG > d.pesoAntesG) return { error: "El peso final no puede ser mayor que el peso antes del proceso" };
  const mermaLote = (1 - d.pesoFinalG / d.pesoAntesG) * 100;
  if (mermaLote > MERMA_MAXIMA) {
    return {
      error: `Esos pesos dan una merma de ${Math.round(mermaLote)} %, que no es realista. Ingresa ambos pesos en kg y de la pieza o tanda completa (no de un paquete).`,
    };
  }
  try {
    await prisma.loteProduccion.create({ data: d });
  } catch {
    return { error: "Ya existe un lote con ese código para este producto" };
  }
  revalidatePath("/", "layout");
  revalidatePath(`/etiquetado/productos/${d.productoId}`);
  return { error: null, ok: `Lote ${d.codigo} registrado` };
}

export async function eliminarLote(fd: FormData): Promise<void> {
  await requerirSesion();
  const lote = await prisma.loteProduccion.delete({ where: { id: Number(fd.get("id")) } });
  revalidatePath("/", "layout");
  redirect(`/etiquetado/productos/${lote.productoId}`);
}

// ---------------------------------------------------------------- datos de rótulo

const rotuloSchema = z.object({
  razonSocial: texto.min(1, "Falta la razón social"),
  domicilio: texto.min(1, "Falta el domicilio"),
  resolucionSanitaria: texto.min(1, "Falta la resolución sanitaria"),
  paisOrigen: texto.min(1, "Falta el país de origen"),
  contacto: textoOpcional,
});

export async function guardarDatosRotulo(_prev: EstadoForm, fd: FormData): Promise<EstadoForm> {
  await requerirSesion();
  const parsed = rotuloSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: primerError(parsed.error) };
  await prisma.datosRotulo.upsert({ where: { id: 1 }, create: { id: 1, ...parsed.data }, update: parsed.data });
  revalidatePath("/etiquetado", "layout");
  return { error: null, ok: "Guardado" };
}
