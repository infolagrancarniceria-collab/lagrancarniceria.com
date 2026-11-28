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
  // g de agua por 100 g (USDA "Water"). La sal de una salmuera entra en el
  // AGUA del tejido, no en la grasa: el modelo de inmersión lo necesita.
  // Null = se estima como 100 − proteínas − grasa − hidratos − 1 (cenizas).
  aguaG: number | null;
}

export type UnidadCantidad = "g" | "kg" | "ml" | "l" | "unidad";

export interface ItemReceta {
  ingredienteId: number;
  cantidad: number;
  unidad: UnidadCantidad;
  // true = la cantidad es "por cada kg de base" (ej. sal 16 g/kg de carne) y
  // se multiplica por kgBase; false = cantidad total del lote.
  porKgBase: boolean;
  // true = ingrediente de la salmuera (inyección/inmersión): no entra
  // completo, solo la fracción absorbida (ver Receta.salmueraAbsorbidaPct).
  enSalmuera?: boolean;
}

export interface Receta {
  kgBase: number;
  items: ItemReceta[];
  // % de peso perdido en el proceso (cocción, ahumado, secado) — 0 si se
  // vende crudo. Pág. 24: el aporte total de la receta no cambia con la
  // pérdida de agua; lo que cambia es el peso final por el que se divide.
  mermaPct: number;
  porcionG: number;
  // Salmuera que queda en la carne, en % del peso de la base (ej. 10 =
  // 100 g de salmuera por kg de carne: lo inyectado más lo que gana al
  // sumergirla, medido por diferencia de peso). Los ingredientes con
  // enSalmuera definen solo la COMPOSICIÓN de la salmuera (ej. 1000 ml de
  // agua + 55 g de sal); lo que entra al producto es esa composición
  // escalada a los gramos absorbidos.
  salmueraAbsorbidaPct?: number | null;
  // Curado por inmersión con modelo de equilibrio (reemplaza a
  // salmueraAbsorbidaPct cuando está presente). Ver ParametrosCurado.
  curado?: ParametrosCurado | null;
  // Parte de la merma que es grasa que gotea (cortes grasos: tocino,
  // costillar), en % del peso perdido. El resto de la merma es agua.
  mermaGrasaPct?: number;
  // % de hueso del producto tal como se vende (0 si es deshuesado).
  huesoPct?: number;
  // true = la tabla se declara por 100 g "tal como se vende" (con hueso);
  // false = por 100 g de parte comestible.
  tablaConHueso?: boolean;
}

// Modelo de curado por inmersión (balance de masa):
// 1. La sal (y la sal de cura, el azúcar…) de toda la salmuera de la tanda se
//    reparte entre el agua de la salmuera y el agua de TODA la carne de la
//    tanda → concentración de equilibrio por gramo de agua.
// 2. Cada pieza alcanza solo una fracción de ese equilibrio en el tiempo de
//    inmersión (depende del grosor): fraccionEq. El azúcar difunde más lento:
//    factorAzucar × fraccionEq.
// 3. Lo absorbido entra en el agua del tejido (no en la grasa).
// 4. El enjuague arrastra enjuaguePct % de lo absorbido por inmersión.
// 5. Si se inyecta, entra además inyeccionPct % del peso con salmuera de la
//    composición de la receta.
export interface ParametrosCurado {
  tandaLitros: number;
  tandaKgCarne: number;
  // Agua promedio (%) de TODA la carne de la tanda (productos mezclados):
  // define el equilibrio. El agua del propio corte define cuánto absorbe él.
  tandaAguaCarnePct: number;
  fraccionEq: number;
  factorAzucar: number;
  enjuaguePct: number;
  inyeccionPct: number;
}

export interface DetalleCurado {
  // g de sal (todo lo que no es azúcar) por 100 g de agua en el equilibrio.
  salEquilibrioPor100Agua: number;
  aguaCarnePct: number;
  // g por kg de carne cruda.
  solutosAbsorbidosGPorKg: number;
  inyectadoGPorKg: number;
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
  // Gramos de salmuera preparada (según la receta) y absorbida por el lote.
  salmuera: { preparadaG: number; absorbidaG: number } | null;
  // Detalle del modelo de inmersión, si se usó.
  curado: DetalleCurado | null;
  // Por 100 g "tal como se vende" (incluyendo hueso), si el producto tiene
  // hueso; por100 es siempre por parte comestible.
  por100ComoSeVende: NutrientesPor100 | null;
  // true = los valores son físicamente imposibles (ej. más de 100 g de
  // macronutrientes en 100 g de producto por una merma mal registrada):
  // la etiqueta no se debe emitir hasta corregir los datos.
  bloqueante: boolean;
}

// Merma máxima razonable: ni los curados más secos pierden más de ~70 %.
// Por encima, casi siempre es un peso mal ingresado (gramos por kilos, el
// peso de un paquete en vez del de la pieza).
export const MERMA_MAXIMA = 70;

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

  // Salmuera: la receta define su COMPOSICIÓN (ej. 1000 ml de agua + 55 g de
  // sal); cuánto entra al producto depende del modo:
  // - curado (modelo de equilibrio por inmersión + inyección), o
  // - salmueraAbsorbidaPct (% del peso de la base, medido por diferencia).
  const itemsSalmuera = receta.items.filter((i) => i.enSalmuera);
  const gramosSalmuera = new Map<ItemReceta, number>();
  let salmuera: ResultadoCalculo["salmuera"] = null;
  let curado: DetalleCurado | null = null;
  if (itemsSalmuera.length > 0 && receta.curado) {
    const c = receta.curado;
    let pesoBase = 0;
    let aguaBase = 0;
    for (const it of receta.items) {
      if (it.enSalmuera) continue;
      const ing = ingredientes.get(it.ingredienteId);
      if (!ing) continue;
      const g = gramosItem(it, ing, receta.kgBase);
      pesoBase += g;
      aguaBase += (g * aguaDe(ing)) / 100;
    }
    const receta_ = itemsSalmuera.map((it) => {
      const ing = ingredientes.get(it.ingredienteId);
      const g = ing ? gramosItem(it, ing, receta.kgBase) : 0;
      const aguaPct = ing ? aguaDe(ing) : 0;
      return { it, ing, g, aguaPct, soluto: (g * (100 - aguaPct)) / 100 };
    });
    const aguaReceta = receta_.reduce((s, r) => s + (r.g * r.aguaPct) / 100, 0);
    const totalReceta = receta_.reduce((s, r) => s + r.g, 0);
    if (aguaReceta <= 0) advertencias.push("La salmuera no tiene agua: agrega el agua de la receta marcada \"en salmuera\".");
    const k = aguaReceta > 0 ? (c.tandaLitros * 1000) / aguaReceta : 0;
    const fracAgua = pesoBase > 0 ? aguaBase / pesoBase : 0;
    const aguaTotalTanda = c.tandaLitros * 1000 + (c.tandaKgCarne * 1000 * c.tandaAguaCarnePct) / 100;
    let salEq = 0;
    let absorbidoTotal = 0;
    let inyectadoTotal = 0;
    for (const r of receta_) {
      if (!r.ing) continue;
      const ceq = aguaTotalTanda > 0 ? (k * r.soluto) / aguaTotalTanda : 0; // g de soluto por g de agua
      if (!r.ing.adicionaAzucares) salEq += ceq * 100;
      const f = c.fraccionEq * (r.ing.adicionaAzucares ? c.factorAzucar : 1);
      const solutoAbsorbido = ceq * aguaBase * f * (1 - c.enjuaguePct / 100);
      const gIngAbsorbido = r.aguaPct < 100 ? solutoAbsorbido / ((100 - r.aguaPct) / 100) : 0;
      const gInyectado = totalReceta > 0 ? ((c.inyeccionPct / 100) * pesoBase * r.g) / totalReceta : 0;
      gramosSalmuera.set(r.it, gIngAbsorbido + gInyectado);
      absorbidoTotal += gIngAbsorbido;
      inyectadoTotal += gInyectado;
    }
    const kgBase = pesoBase / 1000 || 1;
    curado = {
      salEquilibrioPor100Agua: salEq,
      aguaCarnePct: fracAgua * 100,
      solutosAbsorbidosGPorKg: absorbidoTotal / kgBase,
      inyectadoGPorKg: inyectadoTotal / kgBase,
    };
    salmuera = { preparadaG: totalReceta, absorbidaG: absorbidoTotal + inyectadoTotal };
  } else if (itemsSalmuera.length > 0) {
    const preparadaG = itemsSalmuera.reduce((s, it) => {
      const ing = ingredientes.get(it.ingredienteId);
      return ing ? s + gramosItem(it, ing, receta.kgBase) : s;
    }, 0);
    const pct = Math.max(receta.salmueraAbsorbidaPct ?? 0, 0);
    const absorbidaG = (receta.kgBase * 1000 * pct) / 100;
    const factor = preparadaG > 0 ? absorbidaG / preparadaG : 0;
    for (const it of itemsSalmuera) {
      const ing = ingredientes.get(it.ingredienteId);
      if (ing) gramosSalmuera.set(it, gramosItem(it, ing, receta.kgBase) * factor);
    }
    salmuera = { preparadaG, absorbidaG };
    if (pct === 0) advertencias.push("Hay ingredientes de salmuera pero la salmuera absorbida es 0 %: no aportan nada.");
  }

  for (const item of receta.items) {
    const ing = ingredientes.get(item.ingredienteId);
    if (!ing) {
      faltantes.push(item.ingredienteId);
      continue;
    }
    if (item.unidad === "unidad" && !ing.pesoUnidadG) {
      advertencias.push(`"${ing.nombre}" se mide en unidades pero no tiene peso por unidad — cuenta como 0 g.`);
    }
    const g = item.enSalmuera ? gramosSalmuera.get(item) ?? 0 : gramosItem(item, ing, receta.kgBase);
    // Paso 5: regla de tres — aporte = g × valor/100.
    for (const k of CLAVES_NUTRIENTES) totales[k] += (g * ing[k]) / 100;
    const existente = lineas.find((l) => l.ingredienteId === ing.id);
    if (existente) existente.gramos += g;
    else lineas.push({ ingredienteId: ing.id, nombre: ing.nombre, nombreRotulo: ing.nombreRotulo, gramos: g, alergeno: ing.alergeno });
  }

  // Listado de ingredientes: de mayor a menor proporción (pág. 17).
  lineas.sort((a, b) => b.gramos - a.gramos);

  const pesoCrudoG = lineas.reduce((s, l) => s + l.gramos, 0);
  if (receta.mermaPct > MERMA_MAXIMA) {
    advertencias.push(
      `Merma de ${redondearG(receta.mermaPct)} %: no es realista (máximo ${MERMA_MAXIMA} %). Revisa los pesos del lote (ambos en kg, de la pieza completa).`
    );
  }
  const merma = Math.min(Math.max(receta.mermaPct, 0), 95) / 100;
  const pesoFinalG = pesoCrudoG * (1 - merma);

  // Goteo de grasa: parte de la merma es grasa (cortes grasos). Se descuenta
  // de la grasa total y de cada tipo de ácido graso en proporción; el
  // colesterol se queda (está en las membranas del tejido magro).
  const grasaGoteo = Math.min(
    pesoCrudoG * merma * (Math.max(receta.mermaGrasaPct ?? 0, 0) / 100),
    totales.grasaTotalG * 0.9
  );
  if (grasaGoteo > 0 && totales.grasaTotalG > 0) {
    const f = (totales.grasaTotalG - grasaGoteo) / totales.grasaTotalG;
    totales.grasaTotalG *= f;
    totales.grasaSatG *= f;
    totales.grasaMonoG *= f;
    totales.grasaPoliG *= f;
    totales.grasaTransG *= f;
  }

  // Energía con los factores generales del RSA (proteínas 4, grasas 9,
  // hidratos de carbono 4 kcal/g), no con la energía de la tabla de
  // composición (el USDA usa factores específicos por alimento). El alcohol
  // de vinos/cerveza (7 kcal/g) se omite: en dosis de receta y con cocción
  // su aporte es despreciable.
  totales.energiaKcal = 4 * totales.proteinasG + 9 * totales.grasaTotalG + 4 * totales.hcDispG;

  // Paso 8: por 100 g de producto terminado y por porción.
  const huesoPct = Math.min(Math.max(receta.huesoPct ?? 0, 0), 80);
  const por100Comestible = pesoFinalG > 0 ? escalar(totales, 100 / pesoFinalG) : vacio();
  const por100ComoSeVende = huesoPct > 0 ? escalar(por100Comestible, 1 - huesoPct / 100) : null;
  // Lo que se declara (y con lo que se evalúan los sellos).
  const por100 = receta.tablaConHueso && por100ComoSeVende ? por100ComoSeVende : por100Comestible;
  const porPorcion = escalar(por100, receta.porcionG / 100);
  const desglosarGrasas = redondearG(porPorcion.grasaTotalG) >= 3;

  if (receta.porcionG <= 0) advertencias.push("La porción debe ser mayor a 0 g.");


  // Suma de ácidos grasos vs grasa total: en carnes suele ser 85–95 % (el
  // resto es glicerol y otros lípidos). Fuera de rango = dato de origen raro.
  if (por100.grasaTotalG >= 1) {
    const sumaAG = por100.grasaSatG + por100.grasaMonoG + por100.grasaPoliG + por100.grasaTransG;
    const r = sumaAG / por100.grasaTotalG;
    if (r < 0.75 || r > 1.0) {
      advertencias.push(
        `Los ácidos grasos suman ${Math.round(r * 100)} % de la grasa total (lo normal en carnes es 85–95 %): revisa los valores de los ingredientes.`
      );
    }
  }
  if (curado && (por100.sodioMg < 600 || por100.sodioMg > 1500)) {
    advertencias.push(
      `Sodio de ${redondearEntero(por100.sodioMg)} mg/100 g: fuera del rango típico de un curado-ahumado (≈600–1.500). No es un error necesariamente, pero conviene verificarlo con laboratorio.`
    );
  }

  // Controles de plausibilidad: 100 g de producto no pueden tener más de
  // 100 g de sólidos, y sobre ~3.000 mg de sodio (7,5 g de sal) por 100 g
  // ningún producto cárnico es comestible.
  const macros = por100.proteinasG + por100.grasaTotalG + por100.hcDispG;
  const imposible = macros > 100 || receta.mermaPct > MERMA_MAXIMA;
  if (macros > 100) {
    advertencias.push(
      `Imposible: 100 g de producto suman ${redondearG(macros)} g de proteínas, grasas e hidratos. Casi seguro la merma está mal registrada.`
    );
  }
  if (por100.sodioMg > 3000) {
    advertencias.push(
      `Sodio muy alto: ${redondearEntero(por100.sodioMg)} mg/100 g (≈ ${redondearG((por100.sodioMg * 2.54) / 1000)} g de sal). Revisa la merma, que los ingredientes de la salmuera estén marcados "en salmuera" y el % absorbido.`
    );
  }

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
    salmuera,
    curado,
    por100ComoSeVende,
    bloqueante: imposible,
  };
}

// Agua del ingrediente: dato de la tabla o, si falta, estimada por
// diferencia (100 − macronutrientes − ~1 g de cenizas).
export function aguaDe(ing: IngredienteCalculo): number {
  if (ing.aguaG != null) return Math.min(Math.max(ing.aguaG, 0), 100);
  return Math.max(0, 100 - ing.proteinasG - ing.grasaTotalG - ing.hcDispG - 1);
}

// Rango de valores variando los parámetros inciertos (cada uno entre su
// mínimo y su máximo, y la inyección sí/no si está pendiente). Un sello está
// en ZONA GRIS si corresponde en unas combinaciones y en otras no: es lo que
// conviene mandar a laboratorio primero.
export interface RangoParametros {
  fraccionEq?: [number, number];
  factorAzucar?: [number, number];
  merma?: [number, number];
  inyeccion?: "si" | "no" | "pendiente";
  inyeccionPct?: number;
}

export interface ResultadoRango {
  min: NutrientesPor100;
  max: NutrientesPor100;
  zonaGris: Sello[];
  combinaciones: number;
}

export function calcularRango(
  receta: Receta,
  ingredientes: Map<number, IngredienteCalculo>,
  rango: RangoParametros
): ResultadoRango {
  const dos = (r: [number, number] | undefined, central: number) => (r ? [r[0], r[1]] : [central]);
  const c = receta.curado;
  const fracs = c ? dos(rango.fraccionEq, c.fraccionEq) : [0];
  const azucs = c ? dos(rango.factorAzucar, c.factorAzucar) : [0];
  const mermas = dos(rango.merma, receta.mermaPct);
  const inys = c
    ? rango.inyeccion === "pendiente"
      ? [0, rango.inyeccionPct ?? c.inyeccionPct]
      : [c.inyeccionPct]
    : [0];
  const min = vacio();
  const max = vacio();
  for (const k of CLAVES_NUTRIENTES) {
    min[k] = Infinity;
    max[k] = -Infinity;
  }
  const visto = new Map<Sello, Set<boolean>>();
  let n = 0;
  for (const fr of fracs)
    for (const az of azucs)
      for (const me of mermas)
        for (const iy of inys) {
          const r = calcular(
            {
              ...receta,
              mermaPct: me,
              curado: c ? { ...c, fraccionEq: fr, factorAzucar: az, inyeccionPct: iy } : c,
            },
            ingredientes
          );
          n++;
          for (const k of CLAVES_NUTRIENTES) {
            min[k] = Math.min(min[k], r.por100[k]);
            max[k] = Math.max(max[k], r.por100[k]);
          }
          for (const ev of r.sellos) {
            if (!visto.has(ev.sello)) visto.set(ev.sello, new Set());
            visto.get(ev.sello)!.add(ev.corresponde);
          }
        }
  const zonaGris = [...visto.entries()].filter(([, v]) => v.size > 1).map(([s]) => s);
  return { min, max, zonaGris, combinaciones: n };
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
