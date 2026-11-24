// Campos variables que se imprimen encima del diseño propio de la cara
// principal (ej. las líneas "Peso neto ___ g" de un diseño hecho en Canva).
export type CampoDiseno = "neto" | "elab" | "venc" | "lote";

export const CAMPOS_DISENO: { clave: CampoDiseno; etiqueta: string }[] = [
  { clave: "neto", etiqueta: "Peso neto" },
  { clave: "elab", etiqueta: "Elaboración" },
  { clave: "venc", etiqueta: "Vencimiento" },
  { clave: "lote", etiqueta: "Lote" },
];

// Posición en % del ancho (x) y del alto (y) del diseño: el punto donde
// empieza el texto, apoyado sobre la línea.
export type PosicionesCampos = Partial<Record<CampoDiseno, { x: number; y: number }>>;

export function leerPosiciones(json: string | null | undefined): PosicionesCampos {
  if (!json) return {};
  try {
    const datos = JSON.parse(json) as Record<string, unknown>;
    const r: PosicionesCampos = {};
    for (const { clave } of CAMPOS_DISENO) {
      const p = datos[clave] as { x?: unknown; y?: unknown } | undefined;
      if (p && typeof p.x === "number" && typeof p.y === "number" && p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100) {
        r[clave] = { x: p.x, y: p.y };
      }
    }
    return r;
  } catch {
    return {};
  }
}
