// Estado del formulario del modelo de curado por inmersión (editor de
// producto) y su conversión a los parámetros del cálculo. Sin dependencias de
// servidor: se usa en el navegador para la vista previa en vivo.
import type { ParametrosCurado, RangoParametros } from "./calculo";

export type EstadoSupuesto = "confirmado" | "supuesto";

export interface CamposCurado {
  curadoActivo: boolean;
  tandaLitros: string;
  tandaKgCarne: string;
  tandaAguaCarnePct: string;
  fraccionEqMin: string;
  fraccionEqMax: string;
  factorAzucarMin: string;
  factorAzucarMax: string;
  enjuaguePct: string;
  inyeccion: "si" | "no" | "pendiente";
  inyeccionPct: string;
  mermaMinPct: string;
  mermaMaxPct: string;
  mermaGrasaPct: string;
  huesoPct: string;
  tablaConHueso: boolean;
  supuestos: Record<string, EstadoSupuesto>;
}

// Parámetros que se muestran en la hoja de supuestos, con su estado.
export const PARAMETROS_SUPUESTOS: { clave: string; etiqueta: string }[] = [
  { clave: "corte", etiqueta: "Corte y su composición (tabla USDA)" },
  { clave: "salmuera", etiqueta: "Composición de la salmuera" },
  { clave: "salCura", etiqueta: "Tipo de sal de cura" },
  { clave: "tanda", etiqueta: "Tanda (L de salmuera, kg de carne)" },
  { clave: "fraccionEq", etiqueta: "Fracción del equilibrio alcanzada" },
  { clave: "factorAzucar", etiqueta: "Azúcar: fracción respecto de la sal" },
  { clave: "enjuague", etiqueta: "Sal perdida en el enjuague" },
  { clave: "inyeccion", etiqueta: "Inyección" },
  { clave: "merma", etiqueta: "Merma (rango)" },
  { clave: "mermaGrasa", etiqueta: "Goteo de grasa en la merma" },
  { clave: "hueso", etiqueta: "% de hueso" },
  { clave: "porcion", etiqueta: "Porción" },
];

function n(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const x = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(x) ? x : null;
}

const s = (v: number | null | undefined) => (v == null ? "" : String(v).replace(".", ","));

export function camposDesdeProducto(p: {
  curadoActivo: boolean;
  tandaLitros: number | null;
  tandaKgCarne: number | null;
  tandaAguaCarnePct: number;
  fraccionEqMin: number | null;
  fraccionEqMax: number | null;
  factorAzucarMin: number;
  factorAzucarMax: number;
  enjuaguePct: number;
  inyeccion: string;
  inyeccionPct: number;
  mermaMinPct: number | null;
  mermaMaxPct: number | null;
  mermaGrasaPct: number;
  huesoPct: number;
  tablaConHueso: boolean;
  supuestos: string | null;
} | null): CamposCurado {
  let supuestos: Record<string, EstadoSupuesto> = {};
  try {
    supuestos = p?.supuestos ? JSON.parse(p.supuestos) : {};
  } catch {
    supuestos = {};
  }
  return {
    curadoActivo: p?.curadoActivo ?? false,
    tandaLitros: s(p?.tandaLitros ?? 20),
    tandaKgCarne: s(p?.tandaKgCarne ?? 9),
    tandaAguaCarnePct: s(p?.tandaAguaCarnePct ?? 65),
    fraccionEqMin: s(p?.fraccionEqMin ?? 0.5),
    fraccionEqMax: s(p?.fraccionEqMax ?? 0.7),
    factorAzucarMin: s(p?.factorAzucarMin ?? 0.5),
    factorAzucarMax: s(p?.factorAzucarMax ?? 0.7),
    enjuaguePct: s(p?.enjuaguePct ?? 5),
    inyeccion: p?.inyeccion === "si" || p?.inyeccion === "pendiente" ? p.inyeccion : "no",
    inyeccionPct: s(p?.inyeccionPct ?? 10),
    mermaMinPct: s(p?.mermaMinPct),
    mermaMaxPct: s(p?.mermaMaxPct),
    mermaGrasaPct: s(p?.mermaGrasaPct ?? 0),
    huesoPct: s(p?.huesoPct ?? 0),
    tablaConHueso: p?.tablaConHueso ?? false,
    supuestos,
  };
}

export function parametrosDesdeCampos(c: CamposCurado): ParametrosCurado | null {
  if (!c.curadoActivo) return null;
  const fmin = n(c.fraccionEqMin) ?? 0.5;
  const fmax = n(c.fraccionEqMax) ?? fmin;
  const amin = n(c.factorAzucarMin) ?? 0.5;
  const amax = n(c.factorAzucarMax) ?? amin;
  return {
    tandaLitros: n(c.tandaLitros) ?? 20,
    tandaKgCarne: n(c.tandaKgCarne) ?? 9,
    tandaAguaCarnePct: n(c.tandaAguaCarnePct) ?? 65,
    fraccionEq: (fmin + fmax) / 2,
    factorAzucar: (amin + amax) / 2,
    enjuaguePct: n(c.enjuaguePct) ?? 5,
    inyeccionPct: c.inyeccion === "no" ? 0 : n(c.inyeccionPct) ?? 10,
  };
}

export function rangoDesdeCampos(c: CamposCurado): RangoParametros {
  const r: RangoParametros = {};
  const mmin = n(c.mermaMinPct);
  const mmax = n(c.mermaMaxPct);
  if (mmin != null && mmax != null) r.merma = [mmin, mmax];
  if (c.curadoActivo) {
    const fmin = n(c.fraccionEqMin);
    const fmax = n(c.fraccionEqMax);
    if (fmin != null && fmax != null) r.fraccionEq = [fmin, fmax];
    const amin = n(c.factorAzucarMin);
    const amax = n(c.factorAzucarMax);
    if (amin != null && amax != null) r.factorAzucar = [amin, amax];
    r.inyeccion = c.inyeccion;
    r.inyeccionPct = n(c.inyeccionPct) ?? 10;
  }
  return r;
}

export const numeroCampo = n;
