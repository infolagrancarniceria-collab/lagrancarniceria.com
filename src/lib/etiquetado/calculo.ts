// Motor de cálculo de la información nutricional y de los sellos "ALTO EN"
// para productos artesanales — sigue el procedimiento del "Manual de
// Etiquetado Nutricional de Alimentos" (MINSAL, 1ª ed., dic. 2017), págs.
// 19-30 y anexos 2-3. Funciones puras (sin base de datos ni React), así se
// usan igual en el servidor (etiqueta, web pública) y en el navegador (vista
// previa en vivo al editar una receta).

// Valores por 100 g (o 100 ml, ver densidad) de un ingrediente, tal como
// vienen de la tabla de composición (USDA, ficha técnica, etc.).
export interface NutrientesPor100 {
  energiaKcal: number;
  proteinasG: number;
  grasaTotalG: number;
  grasaSatG: number;
  grasaMonoG: number;
  grasaPoliG: number;
  grasaTransG: number;
  colesterolMg: number;
  hcDispG: number;
  azucaresG: number;
  sodioMg: number;
}

export const CLAVES_NUTRIENTES: (keyof NutrientesPor100)[] = [
  "energiaKcal",
  "proteinasG",
  "grasaTotalG",
  "grasaSatG",
  "grasaMonoG",
  "grasaPoliG",
  "grasaTransG",
  "colesterolMg",
  "hcDispG",
  "azucaresG",
  "sodioMg",
];

export interface IngredienteCalculo extends NutrientesPor100 {
  id: number;
  nombre: string;
  nombreRotulo: string;
  // Anexo 2 del manual: si el ingrediente "adiciona" el nutriente crítico.
  // Sin adición, el sello no corresponde aunque se supere el límite.
  adicionaSodio: boolean;
  adicionaAzucares: boolean;
  adicionaGrasas: boolean;
  // g por ml — para ingredientes que se miden en ml (agua, vino).
  densidadGMl: number;
  // Peso de 1 unidad en g (ej. 1 diente de ajo) — null si no se mide en unidades.
  pesoUnidadG: number | null;
  alergeno: string | null;
}

export type UnidadCantidad = "g" | "kg" | "ml" | "l" | "unidad";

export interface ItemReceta {
  ingredienteId: number;
  cantidad: number;
  unidad: UnidadCantidad;
  // true = la cantidad es "por cada kg de base" (ej. sal 16 g/kg de carne) y
  // se multiplica por kgBase; false = cantidad total del lote.
  porKgBase: boolean;
}

export interface Receta {
  kgBase: number;
  items: ItemReceta[];
  // % de peso perdido en el proceso (cocción, ahumado, secado) — 0 si se
  // vende crudo. Pág. 24: el aporte total de la receta no cambia con la
  // pérdida de agua; lo que cambia es el peso final por el que se divide.
  mermaPct: number;
  porcionG: number;
}

// Límites del RSA para sólidos (Imagen N°11, pág. 28 — vigentes desde el
// 27/06/2019). La imagen del manual rotula el sodio como "400 Kcal/100g":
// es una errata, la unidad es mg.
export const LIMITES_SOLIDOS = {
  energiaKcal: 275,
  sodioMg: 400,
  azucaresG: 10,
  grasaSatG: 4,
} as const;

export type Sello = "azucares" | "grasasSaturadas" | "sodio" | "calorias";

export const TEXTO_SELLO: Record<Sello, string> = {
  azucares: "AZÚCARES",
  grasasSaturadas: "GRASAS SATURADAS",
  sodio: "SODIO",
  calorias: "CALORÍAS",
};

export interface EvaluacionSello {
  sello: Sello;
  adicionado: boolean;
  // Ingredientes que gatillan la adición (para mostrar el porqué).
  ingredientesQueAdicionan: string[];
  valorPor100: number;
  limite: number;
  supera: boolean;
  corresponde: boolean;
}

export interface LineaIngredienteCalculada {
  ingredienteId: number;
  nombre: string;
  nombreRotulo: string;
  gramos: number;
  alergeno: string | null;
}

export interface ResultadoCalculo {
  lineas: LineaIngredienteCalculada[];
  pesoCrudoG: number;
  pesoFinalG: number;
  totales: NutrientesPor100;
  por100: NutrientesPor100;
  porPorcion: NutrientesPor100;
  // Pág. 19/25: si la porción aporta 3 g o más de grasa total, se declaran
  // además saturadas, mono, poli, trans y colesterol.
  desglosarGrasas: boolean;
  sellos: EvaluacionSello[];
  sellosQueCorresponden: Sello[];
  ingredientesFaltantes: number[];
  advertencias: string[];
}

function vacio(): NutrientesPor100 {
  return {
    energiaKcal: 0,
    proteinasG: 0,
    grasaTotalG: 0,
    grasaSatG: 0,
    grasaMonoG: 0,
    grasaPoliG: 0,
    grasaTransG: 0,
    colesterolMg: 0,
    hcDispG: 0,
    azucaresG: 0,
    sodioMg: 0,
  };
}

function escalar(n: NutrientesPor100, factor: number): NutrientesPor100 {
  const r = vacio();
  for (const k of CLAVES_NUTRIENTES) r[k] = n[k] * factor;
  return r;
}

// Gramos reales de un item de la receta (pasos 1 y 5 del manual, pág. 23).
export function gramosItem(item: ItemReceta, ing: IngredienteCalculo, kgBase: number): number {
  let g: number;
  switch (item.unidad) {
    case "g":
      g = item.cantidad;
      break;
    case "kg":
      g = item.cantidad * 1000;
      break;
    case "ml":
      g = item.cantidad * ing.densidadGMl;
      break;
    case "l":
      g = item.cantidad * 1000 * ing.densidadGMl;
      break;
    case "unidad":
      g = item.cantidad * (ing.pesoUnidadG ?? 0);
      break;
  }
  return item.porKgBase ? g * kgBase : g;
}

export function calcular(receta: Receta, ingredientes: Map<number, IngredienteCalculo>): ResultadoCalculo {
  const advertencias: string[] = [];
  const faltantes: number[] = [];
  const lineas: LineaIngredienteCalculada[] = [];
  const totales = vacio();

  for (const item of receta.items) {
    const ing = ingredientes.get(item.ingredienteId);
    if (!ing) {
      faltantes.push(item.ingredienteId);
      continue;
    }
    if (item.unidad === "unidad" && !ing.pesoUnidadG) {
      advertencias.push(`"${ing.nombre}" se mide en unidades pero no tiene peso por unidad — cuenta como 0 g.`);
    }
    const g = gramosItem(item, ing, receta.kgBase);
    // Paso 5: regla de tres — aporte = g × valor/100.
    for (const k of CLAVES_NUTRIENTES) totales[k] += (g * ing[k]) / 100;
    const existente = lineas.find((l) => l.ingredienteId === ing.id);
    if (existente) existente.gramos += g;
    else lineas.push({ ingredienteId: ing.id, nombre: ing.nombre, nombreRotulo: ing.nombreRotulo, gramos: g, alergeno: ing.alergeno });
  }

  // Listado de ingredientes: de mayor a menor proporción (pág. 17).
  lineas.sort((a, b) => b.gramos - a.gramos);

  const pesoCrudoG = lineas.reduce((s, l) => s + l.gramos, 0);
  const merma = Math.min(Math.max(receta.mermaPct, 0), 95) / 100;
  const pesoFinalG = pesoCrudoG * (1 - merma);

  // Paso 8: por 100 g de producto terminado y por porción.
  const por100 = pesoFinalG > 0 ? escalar(totales, 100 / pesoFinalG) : vacio();
  const porPorcion = escalar(por100, receta.porcionG / 100);
  const desglosarGrasas = redondearG(porPorcion.grasaTotalG) >= 3;

  if (receta.porcionG <= 0) advertencias.push("La porción debe ser mayor a 0 g.");

  const nombresQue = (campo: "adicionaSodio" | "adicionaAzucares" | "adicionaGrasas") =>
    lineas.filter((l) => ingredientes.get(l.ingredienteId)?.[campo]).map((l) => l.nombre);

  const adSodio = nombresQue("adicionaSodio");
  const adAzucares = nombresQue("adicionaAzucares");
  const adGrasas = nombresQue("adicionaGrasas");

  // Pág. 28-29: sodio solo si se adicionó sodio; azúcares si se adicionaron
  // azúcares; grasas saturadas si se adicionaron grasas; calorías si se
  // adicionaron azúcares o grasas. Se compara con el valor ya redondeado tal
  // como se declara en la tabla, para que etiqueta y sello sean coherentes.
  const evaluar = (sello: Sello, adicionadoPor: string[], valor: number, limite: number): EvaluacionSello => {
    const supera = valor > limite;
    return {
      sello,
      adicionado: adicionadoPor.length > 0,
      ingredientesQueAdicionan: adicionadoPor,
      valorPor100: valor,
      limite,
      supera,
      corresponde: adicionadoPor.length > 0 && supera,
    };
  };

  const sellos: EvaluacionSello[] = [
    evaluar("azucares", adAzucares, redondearG(por100.azucaresG), LIMITES_SOLIDOS.azucaresG),
    evaluar("grasasSaturadas", adGrasas, redondearG(por100.grasaSatG), LIMITES_SOLIDOS.grasaSatG),
    evaluar("sodio", adSodio, redondearEntero(por100.sodioMg), LIMITES_SOLIDOS.sodioMg),
    evaluar("calorias", [...adAzucares, ...adGrasas], redondearEntero(por100.energiaKcal), LIMITES_SOLIDOS.energiaKcal),
  ];

  return {
    lineas,
    pesoCrudoG,
    pesoFinalG,
    totales,
    por100,
    porPorcion,
    desglosarGrasas,
    sellos,
    sellosQueCorresponden: sellos.filter((s) => s.corresponde).map((s) => s.sello),
    ingredientesFaltantes: faltantes,
    advertencias,
  };
}

// Redondeo (pág. 26): dígito descartado >= 5 sube. kcal y mg en enteros,
// gramos con 1 decimal.
export function redondearEntero(v: number): number {
  return Math.round(v + 1e-9);
}

export function redondearG(v: number): number {
  return Math.round(v * 10 + 1e-9) / 10;
}

export function formatoG(v: number): string {
  return redondearG(v).toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatoEntero(v: number): string {
  return redondearEntero(v).toLocaleString("es-CL");
}

// Imagen N°13, pág. 30: tamaño del sello según el área de la cara principal.
export function tamanoSelloCm(areaCm2: number): number | null {
  if (areaCm2 < 30) return null; // va en el envase mayor que los contenga
  if (areaCm2 < 60) return 1.5;
  if (areaCm2 < 100) return 2.0;
  if (areaCm2 < 200) return 2.5;
  if (areaCm2 < 300) return 3.0;
  return 3.5;
}

// Número de porciones por envase (entero, pág. 20).
export function porcionesPorEnvase(netoG: number, porcionG: number): number {
  if (porcionG <= 0) return 0;
  return Math.max(1, Math.round(netoG / porcionG));
}

// "carne de cerdo, agua, sal, ..." — nombres de rótulo en orden decreciente.
export function textoIngredientes(lineas: LineaIngredienteCalculada[]): string {
  const vistos = new Set<string>();
  const partes: string[] = [];
  for (const l of lineas) {
    const n = l.nombreRotulo.trim();
    if (!n || vistos.has(n.toLowerCase())) continue;
    vistos.add(n.toLowerCase());
    partes.push(n);
  }
  const texto = partes.join(", ");
  return texto.charAt(0).toUpperCase() + texto.slice(1) + ".";
}

export function alergenosDe(lineas: LineaIngredienteCalculada[]): string[] {
  const set = new Set<string>();
  for (const l of lineas) {
    for (const a of (l.alergeno ?? "").split(",")) {
      const t = a.trim();
      if (t) set.add(t);
    }
  }
  return [...set];
}
