// Fotos reales de producto, subidas para el diseño anterior del sitio
// (quedaron en legacy-claude-design/image-slots.state.json, nunca se
// conectaron al rediseño) — 61 fotos en /public/productos, con nombre de
// archivo tipo "prod-{familia}-{corte}.webp" (familia: vac/cer/pol/art).
//
// El emparejamiento es por palabras clave de la descripción, no por PLU:
// el PLU que carga el POS puede no coincidir exacto con el que se supuso
// al armar esta lista (scripts/cargar-catalogo-real.ts, del lado del POS,
// donde además el Pollo quedó afuera de la carga por no tener PLU
// confiable) — mientras que el nombre del corte (ej. "Chuleta de Centro")
// es mucho más estable, no depende de qué PLU haya terminado usando cada
// producto real. Cada regla queda MUY acotada (categoría + combinación de
// palabras específica) para no arriesgar mostrar la foto de un corte
// distinto por una coincidencia de texto ambigua — se prefiere dejar un
// producto sin foto (ej. "Resto de Hueso", o "Pulpa de Cerdo Magra" con
// dos fotos candidatas sin forma de saber cuál es la correcta) antes que
// adivinar mal.
//
// El orden importa dentro de cada categoría: las reglas más específicas
// van primero, para que por ejemplo "Trutro Entero" no caiga en la regla
// genérica de "Trutro" + "Ala", o "Punta de Ganso" no le gane la regla más
// específica de "Pollo Ganso".
interface ReglaImagen {
  categoriaNombre: string;
  palabras: string[];
  slug: string;
}

const REGLAS: ReglaImagen[] = [
  // --- Cerdo ---
  { categoriaNombre: "Cerdo", palabras: ["cuero"], slug: "cer-cuero" },
  { categoriaNombre: "Cerdo", palabras: ["manitos"], slug: "cer-manitos" },
  { categoriaNombre: "Cerdo", palabras: ["pernil"], slug: "cer-pernil-crudo" },
  { categoriaNombre: "Cerdo", palabras: ["cazuela"], slug: "cer-cazuela" },
  { categoriaNombre: "Cerdo", palabras: ["paleta"], slug: "cer-paleta" },
  { categoriaNombre: "Cerdo", palabras: ["tocino"], slug: "cer-tocino" },
  { categoriaNombre: "Cerdo", palabras: ["chuleta", "parrillera"], slug: "cer-chuleta-parrillera" },
  { categoriaNombre: "Cerdo", palabras: ["chuleta", "centro"], slug: "cer-chuleta-centro" },
  { categoriaNombre: "Cerdo", palabras: ["lomo", "centro"], slug: "cer-lomo-centro" },
  { categoriaNombre: "Cerdo", palabras: ["malaya", "chica"], slug: "cer-malaya-chica" },
  { categoriaNombre: "Cerdo", palabras: ["malaya", "900"], slug: "cer-malaya-900" },
  { categoriaNombre: "Cerdo", palabras: ["filete"], slug: "cer-filete" },
  { categoriaNombre: "Cerdo", palabras: ["costillitas", "baby"], slug: "cer-costillitas-baby" },
  { categoriaNombre: "Cerdo", palabras: ["pulpa", "45"], slug: "cer-pulpa-45" },

  // --- Vacuno ---
  { categoriaNombre: "Vacuno", palabras: ["patas"], slug: "vac-patas" },
  { categoriaNombre: "Vacuno", palabras: ["molida", "especial"], slug: "vac-molida-especial" },
  { categoriaNombre: "Vacuno", palabras: ["molida", "corriente"], slug: "vac-molida-corriente" },
  { categoriaNombre: "Vacuno", palabras: ["sobrecostilla"], slug: "vac-sobrecostilla" },
  { categoriaNombre: "Vacuno", palabras: ["huachalomo"], slug: "vac-huachalomo" },
  { categoriaNombre: "Vacuno", palabras: ["pollo", "ganso"], slug: "vac-pollo-ganso" },
  { categoriaNombre: "Vacuno", palabras: ["punta", "ganso"], slug: "vac-punta-ganso" },
  { categoriaNombre: "Vacuno", palabras: ["asado", "carnicero"], slug: "vac-asado-carnicero" },
  { categoriaNombre: "Vacuno", palabras: ["americano"], slug: "vac-asado-americano" },
  { categoriaNombre: "Vacuno", palabras: ["tapapecho"], slug: "vac-tapapecho" },
  { categoriaNombre: "Vacuno", palabras: ["abastero"], slug: "vac-abastero" },
  { categoriaNombre: "Vacuno", palabras: ["choclillo"], slug: "vac-choclillo" },
  { categoriaNombre: "Vacuno", palabras: ["ganso"], slug: "vac-ganso" }, // genérico, después de "pollo ganso" y "punta ganso"
  { categoriaNombre: "Vacuno", palabras: ["palanca"], slug: "vac-palanca" },
  { categoriaNombre: "Vacuno", palabras: ["osobuco"], slug: "vac-osobuco" },
  { categoriaNombre: "Vacuno", palabras: ["churrasco"], slug: "vac-churrasco" },
  { categoriaNombre: "Vacuno", palabras: ["punta", "picana"], slug: "vac-punta-picana" },
  { categoriaNombre: "Vacuno", palabras: ["carne", "picada"], slug: "vac-carne-picada" },
  { categoriaNombre: "Vacuno", palabras: ["posta", "rosada"], slug: "vac-posta-rosada" },
  { categoriaNombre: "Vacuno", palabras: ["posta", "paleta"], slug: "vac-posta-paleta" },
  { categoriaNombre: "Vacuno", palabras: ["posta", "negra"], slug: "vac-posta-negra" },
  { categoriaNombre: "Vacuno", palabras: ["asiento"], slug: "vac-asiento" },
  { categoriaNombre: "Vacuno", palabras: ["flat"], slug: "vac-flat-iron" },
  { categoriaNombre: "Vacuno", palabras: ["lomo", "liso"], slug: "vac-lomo-liso" },
  { categoriaNombre: "Vacuno", palabras: ["lomo", "vetado"], slug: "vac-lomo-vetado" },
  { categoriaNombre: "Vacuno", palabras: ["filete"], slug: "vac-filete" },
  { categoriaNombre: "Vacuno", palabras: ["corazon"], slug: "vac-corazon" },
  { categoriaNombre: "Vacuno", palabras: ["costilla", "derecha"], slug: "vac-costilla-derecha" },
  { categoriaNombre: "Vacuno", palabras: ["entrana"], slug: "vac-entrana" },
  { categoriaNombre: "Vacuno", palabras: ["guata"], slug: "vac-guata" },
  { categoriaNombre: "Vacuno", palabras: ["pana"], slug: "vac-pana" },

  // --- Congelados ---
  { categoriaNombre: "Congelados", palabras: ["ala", "centro"], slug: "con-ala-centro" },
  { categoriaNombre: "Congelados", palabras: ["arandanos"], slug: "con-arandanos" },
  { categoriaNombre: "Congelados", palabras: ["aros", "cebolla"], slug: "con-aros-cebolla" },
  { categoriaNombre: "Congelados", palabras: ["arvejas"], slug: "con-arvejas" },
  { categoriaNombre: "Congelados", palabras: ["pasta", "choclo"], slug: "con-pasta-choclo" },
  { categoriaNombre: "Congelados", palabras: ["choclo", "tierno"], slug: "con-choclo-tierno" },
  { categoriaNombre: "Congelados", palabras: ["choclo"], slug: "con-choclo" }, // genérico, después de "pasta choclo" y "choclo tierno"
  { categoriaNombre: "Congelados", palabras: ["crianza"], slug: "con-hamburguesa-crianza" },
  { categoriaNombre: "Congelados", palabras: ["salmon", "natural"], slug: "con-salmon-natural" },
  { categoriaNombre: "Congelados", palabras: ["salmon", "empanizado"], slug: "con-salmon-empanizado" },
  { categoriaNombre: "Congelados", palabras: ["mix", "berries"], slug: "con-mix-berries" },
  { categoriaNombre: "Congelados", palabras: ["nuggets"], slug: "con-nuggets-pollo" },
  { categoriaNombre: "Congelados", palabras: ["papas", "fritas"], slug: "con-papas-fritas" },
  { categoriaNombre: "Congelados", palabras: ["pulpa", "maracuya"], slug: "con-pulpa-maracuya" },

  // --- Artesanales ---
  { categoriaNombre: "Artesanales", palabras: ["lomo", "ahumado"], slug: "art-lomo-ahumado" },
  { categoriaNombre: "Artesanales", palabras: ["choripan", "tradicional"], slug: "art-choripan-tradicional" },
  { categoriaNombre: "Artesanales", palabras: ["choripan", "picante"], slug: "art-choripan-picante" },
  { categoriaNombre: "Artesanales", palabras: ["longaniza", "picante"], slug: "art-longaniza-picante" },

  // --- Pollo — quedó fuera de la carga real del POS (sin PLU confiable en
  // el documento de rediseño), así que ya nace dependiendo por completo de
  // la descripción.
  { categoriaNombre: "Pollo", palabras: ["trutro", "largo"], slug: "pol-trutro-largo" },
  { categoriaNombre: "Pollo", palabras: ["trutro", "barquillo"], slug: "pol-trutro-largo" },
  { categoriaNombre: "Pollo", palabras: ["trutro", "entero"], slug: "pol-trutro-entero" },
  { categoriaNombre: "Pollo", palabras: ["trutro", "corto"], slug: "pol-trutro-corto" },
  { categoriaNombre: "Pollo", palabras: ["trutro", "deshuesado"], slug: "pol-trutro-deshuesado" },
  { categoriaNombre: "Pollo", palabras: ["trutro", "ala"], slug: "pol-trutro-ala" },
  { categoriaNombre: "Pollo", palabras: ["pechuga", "entera"], slug: "pol-pechuga-entera" },
  { categoriaNombre: "Pollo", palabras: ["pechuga", "trozo"], slug: "pol-pechuga-trozo" },
  { categoriaNombre: "Pollo", palabras: ["pechuga", "deshuesada"], slug: "pol-pechuga-deshuesada" },
  { categoriaNombre: "Pollo", palabras: ["ala", "entera"], slug: "pol-ala-entera" },
  { categoriaNombre: "Pollo", palabras: ["pollo", "entero"], slug: "pol-entero" },
  { categoriaNombre: "Pollo", palabras: ["panita"], slug: "pol-panita" },
  { categoriaNombre: "Pollo", palabras: ["pana"], slug: "pol-panita" }, // "pana" = forma corta/coloquial de "panita" (higado de pollo)
  { categoriaNombre: "Pollo", palabras: ["patas"], slug: "pol-patas" },
  { categoriaNombre: "Pollo", palabras: ["cazuela"], slug: "pol-cazuela" },
  { categoriaNombre: "Pollo", palabras: ["contre"], slug: "pol-contre" },
  { categoriaNombre: "Pollo", palabras: ["corazon"], slug: "pol-corazon" },
  { categoriaNombre: "Pollo", palabras: ["filete"], slug: "pol-filete" },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// La categoría real en el POS puede no coincidir textualmente con el
// nombre que se usó al armar las reglas de arriba (ej. el Pollo está
// cargado como categoría "AVES", no "Pollo") — cada categoría de regla
// acepta una lista de nombres reales equivalentes, comparados sin
// importar mayúsculas/acentos. Si una categoría no aparece acá, se
// compara tal cual contra su propio nombre.
const CATEGORIAS_EQUIVALENTES: Record<string, string[]> = {
  Pollo: ["pollo", "aves"],
};

function categoriaCoincide(categoriaRegla: string, categoriaProducto: string): boolean {
  const equivalentes = CATEGORIAS_EQUIVALENTES[categoriaRegla] ?? [normalizar(categoriaRegla)];
  return equivalentes.includes(normalizar(categoriaProducto));
}

// Devuelve la ruta pública de la foto del producto, o null si no hay una
// emparejada — quien la use debe manejar el caso sin foto (ver
// ProductoCard), no todos los productos tienen una todavía.
export function imagenProducto(producto: { descripcion: string; categoriaNombre: string }): string | null {
  const descripcionNormalizada = normalizar(producto.descripcion);
  const regla = REGLAS.find(
    ({ categoriaNombre, palabras }) =>
      categoriaCoincide(categoriaNombre, producto.categoriaNombre) &&
      palabras.every((palabra) => descripcionNormalizada.includes(palabra))
  );
  return regla ? `/productos/prod-${regla.slug}.webp` : null;
}
