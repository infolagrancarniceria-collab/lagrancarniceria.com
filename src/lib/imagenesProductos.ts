// Fotos reales de producto, subidas para el diseño anterior del sitio
// (quedaron en legacy-claude-design/image-slots.state.json, nunca se
// conectaron al rediseño) — 61 fotos en /public/productos, con nombre de
// archivo tipo "prod-{familia}-{corte}.webp" (familia: vac/cer/pol/art).
//
// El emparejamiento con el producto real es por PLU cuando se puede (más
// confiable, no depende de cómo esté escrita la descripción) — hecho a
// mano contra scripts/cargar-catalogo-real.ts del POS, no programático:
// se prefiere dejar un producto SIN foto antes que arriesgar mostrar la
// foto de un corte distinto por una coincidencia de texto ambigua (ej.
// "Pulpa de Cerdo Magra" vs. las fotos "pulpa-45"/"pulpa-trozo" — no hay
// forma de saber cuál es sin preguntar, así que ese producto queda sin
// foto en vez de adivinar).
export const IMAGEN_POR_PLU: Record<string, string> = {
  // Cerdo
  "805": "cer-cuero", // Cuero de Cerdo
  "808": "cer-manitos", // Manitos de Cerdo
  "806": "cer-pernil-crudo", // Pernil Crudo
  "794": "cer-cazuela", // Cazuela de Cerdo
  "815": "cer-paleta", // Paleta de Cerdo
  "800": "cer-tocino", // Tocino Chicharrón
  "796": "cer-chuleta-parrillera", // Chuleta Parrillera
  "795": "cer-chuleta-centro", // Chuleta de Centro
  "792": "cer-lomo-centro", // Lomo Centro
  "807": "cer-malaya-chica", // Malaya de Cerdo Chica 400 g
  "802": "cer-filete", // Filete de Cerdo
  "810": "cer-costillitas-baby", // Costillitas Baby
  "803": "cer-malaya-900", // Malaya Cerdo 900 g

  // Vacuno
  "839": "vac-patas", // Patas de Vacuno
  "817": "vac-molida-especial", // Molida Especial
  "833": "vac-sobrecostilla", // Sobrecostilla
  "843": "vac-huachalomo", // Huachalomo
  "840": "vac-pollo-ganso", // Pollo Ganso
  "828": "vac-asado-carnicero", // Asado Carnicero
  "842": "vac-tapapecho", // Tapapecho
  "826": "vac-abastero", // Abastero Vacuno
  "827": "vac-choclillo", // Choclillo
  "846": "vac-ganso", // Punta de Ganso — único corte de "ganso" suelto sin usar
  "845": "vac-palanca", // Palanca de Vacuno
  "835": "vac-osobuco", // Osobuco de Vacuno
  "819": "vac-churrasco", // Churrasco de Vacuno
  "838": "vac-punta-picana", // Punta Picana
  "829": "vac-carne-picada", // Carne Picada
  "830": "vac-posta-rosada", // Posta Rosada
  "832": "vac-posta-paleta", // Posta Paleta
  "825": "vac-posta-negra", // Posta Negra
  "822": "vac-asiento", // Asiento
  "836": "vac-flat-iron", // Flat Iron
  "821": "vac-lomo-liso", // Lomo Liso
  "820": "vac-lomo-vetado", // Lomo Vetado Vacuno
  "844": "vac-filete", // Filete de Vacuno

  // Artesanales
  "799": "art-lomo-ahumado", // Lomo Ahumado
};

// El Pollo quedó fuera de la carga real (scripts/cargar-catalogo-real.ts)
// porque el documento de rediseño no traía PLU confiable para esos 16
// productos — así que todavía no hay un PLU con el que emparejar por
// código. En vez de dejarlos sin foto hasta que alguien vuelva a tocar
// este archivo, se empareja por palabras clave de la descripción (más
// frágil que por PLU: depende de cómo se termine escribiendo cada
// producto en el POS). Revisar/ajustar esta lista en cuanto el Pollo esté
// cargado de verdad — lo ideal es migrarlos a IMAGEN_POR_PLU ni bien
// tengan PLU. El orden importa: los patrones más específicos van primero,
// para que "Trutro Entero" no termine cayendo en el patrón genérico de
// "Trutro Ala".
const IMAGEN_POR_PALABRAS_CLAVE_POLLO: { palabras: string[]; slug: string }[] = [
  { palabras: ["trutro", "largo"], slug: "pol-trutro-largo" },
  { palabras: ["trutro", "barquillo"], slug: "pol-trutro-largo" },
  { palabras: ["trutro", "entero"], slug: "pol-trutro-entero" },
  { palabras: ["trutro", "corto"], slug: "pol-trutro-corto" },
  { palabras: ["trutro", "deshuesado"], slug: "pol-trutro-deshuesado" },
  { palabras: ["trutro", "ala"], slug: "pol-trutro-ala" },
  { palabras: ["pechuga", "entera"], slug: "pol-pechuga-entera" },
  { palabras: ["pechuga", "trozo"], slug: "pol-pechuga-trozo" },
  { palabras: ["pechuga", "deshuesada"], slug: "pol-pechuga-deshuesada" },
  { palabras: ["ala", "entera"], slug: "pol-ala-entera" },
  { palabras: ["pollo", "entero"], slug: "pol-entero" },
  { palabras: ["panita"], slug: "pol-panita" },
  { palabras: ["patas"], slug: "pol-patas" },
  { palabras: ["cazuela"], slug: "pol-cazuela" },
  { palabras: ["contre"], slug: "pol-contre" },
  { palabras: ["corazon"], slug: "pol-corazon" },
  { palabras: ["filete"], slug: "pol-filete" },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Devuelve la ruta pública de la foto del producto, o null si no hay una
// emparejada — quien la use debe manejar el caso sin foto (ver
// ProductoCard), no todos los productos tienen una todavía.
export function imagenProducto(producto: { plu: string; descripcion: string; categoriaNombre: string }): string | null {
  const slugPorPlu = IMAGEN_POR_PLU[producto.plu];
  if (slugPorPlu) return `/productos/prod-${slugPorPlu}.webp`;

  if (producto.categoriaNombre === "Pollo") {
    const descripcionNormalizada = normalizar(producto.descripcion);
    const coincidencia = IMAGEN_POR_PALABRAS_CLAVE_POLLO.find(({ palabras }) =>
      palabras.every((palabra) => descripcionNormalizada.includes(palabra))
    );
    if (coincidencia) return `/productos/prod-${coincidencia.slug}.webp`;
  }

  return null;
}
