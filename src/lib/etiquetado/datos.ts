import type { IngredienteNutricional, LoteProduccion, ProductoArtesanal, RecetaItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  calcular,
  textoIngredientes,
  type IngredienteCalculo,
  type ItemReceta,
  type NutrientesPor100,
  type ResultadoCalculo,
  type Sello,
  type UnidadCantidad,
} from "./calculo";

export const UNIDADES: UnidadCantidad[] = ["g", "kg", "ml", "l", "unidad"];

export function aIngredienteCalculo(i: IngredienteNutricional): IngredienteCalculo {
  return {
    id: i.id,
    nombre: i.nombre,
    nombreRotulo: i.nombreRotulo,
    energiaKcal: i.energiaKcal,
    proteinasG: i.proteinasG,
    grasaTotalG: i.grasaTotalG,
    grasaSatG: i.grasaSatG,
    grasaMonoG: i.grasaMonoG,
    grasaPoliG: i.grasaPoliG,
    grasaTransG: i.grasaTransG,
    colesterolMg: i.colesterolMg,
    hcDispG: i.hcDispG,
    azucaresG: i.azucaresG,
    sodioMg: i.sodioMg,
    adicionaSodio: i.adicionaSodio,
    adicionaAzucares: i.adicionaAzucares,
    adicionaGrasas: i.adicionaGrasas,
    densidadGMl: i.densidadGMl,
    pesoUnidadG: i.pesoUnidadG,
    alergeno: i.alergeno,
  };
}

export function aItemReceta(i: RecetaItem): ItemReceta {
  return {
    ingredienteId: i.ingredienteId,
    cantidad: i.cantidad,
    unidad: (UNIDADES as string[]).includes(i.unidad) ? (i.unidad as UnidadCantidad) : "g",
    porKgBase: i.porKgBase,
  };
}

export function mermaDeLote(l: Pick<LoteProduccion, "pesoAntesG" | "pesoFinalG">): number {
  if (l.pesoAntesG <= 0) return 0;
  return Math.max(0, (1 - l.pesoFinalG / l.pesoAntesG) * 100);
}

export function fechaVencimientoLote(
  l: Pick<LoteProduccion, "fechaElaboracion" | "fechaVencimiento">,
  vidaUtilDias: number | null
): Date | null {
  if (l.fechaVencimiento) return l.fechaVencimiento;
  if (vidaUtilDias == null) return null;
  const d = new Date(l.fechaElaboracion);
  d.setUTCDate(d.getUTCDate() + vidaUtilDias);
  return d;
}

// Fechas guardadas a medianoche UTC (vienen de <input type="date">) — se
// formatean en UTC para que no corran un día según la zona horaria.
export function formatoFecha(d: Date | null): string {
  if (!d) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const aa = String(d.getUTCFullYear()).slice(-2);
  return `${dd}/${mm}/${aa}`;
}

export function fechaInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export async function mapaIngredientes(): Promise<Map<number, IngredienteCalculo>> {
  const ings = await prisma.ingredienteNutricional.findMany();
  return new Map(ings.map((i) => [i.id, aIngredienteCalculo(i)]));
}

export function calcularProducto(
  p: ProductoArtesanal & { items: RecetaItem[] },
  ingredientes: Map<number, IngredienteCalculo>,
  mermaPct: number = p.mermaPct
): ResultadoCalculo {
  return calcular(
    { kgBase: p.kgBase, mermaPct, porcionG: p.porcionG, items: [...p.items].sort((a, b) => a.orden - b.orden).map(aItemReceta) },
    ingredientes
  );
}

// Lo que la web pública muestra en la ficha de un producto (sin datos
// internos como la receta en gramos).
export interface EtiquetaPublica {
  idPos: number;
  porcionG: number;
  porcionMedidaCasera: string;
  por100: NutrientesPor100;
  porPorcion: NutrientesPor100;
  desglosarGrasas: boolean;
  sellos: Sello[];
  ingredientes: string;
}

// Para la web: usa la merma del último lote registrado (el dato real más
// reciente) o, si no hay lotes, la merma típica del producto.
export async function etiquetasPublicas(): Promise<EtiquetaPublica[]> {
  const productos = await prisma.productoArtesanal.findMany({
    where: { publicarEnWeb: true, idPosWeb: { not: null } },
    include: { items: true, lotes: { orderBy: { fechaElaboracion: "desc" }, take: 1 } },
  });
  if (productos.length === 0) return [];
  const ingredientes = await mapaIngredientes();
  return productos.map((p) => {
    const merma = p.lotes[0] ? mermaDeLote(p.lotes[0]) : p.mermaPct;
    const r = calcularProducto(p, ingredientes, merma);
    return {
      idPos: p.idPosWeb!,
      porcionG: p.porcionG,
      porcionMedidaCasera: p.porcionMedidaCasera,
      por100: r.por100,
      porPorcion: r.porPorcion,
      desglosarGrasas: r.desglosarGrasas,
      sellos: r.sellosQueCorresponden,
      ingredientes: textoIngredientes(r.lineas),
    };
  });
}
