export type Disponibilidad = "disponible" | "agotado" | "proximamente";
export type UnidadVenta = "kg" | "unidad";
export type Envasado = "Tradicional" | "Al vacío";
export type TipoEntrega = "retiro" | "despacho";
export type MedioPago = "Efectivo" | "Transferencia" | "Tarjeta débito/crédito";

export interface ProductoPublico {
  idPos: number;
  plu: string;
  descripcion: string;
  nombreCorto: string | null;
  categoriaNombre: string;
  marca: string | null;
  descripcionCorta: string | null;
  precio: number;
  unidad: UnidadVenta;
  familiaCorte: string | null;
  // Peso promedio de un trozo/presa (g) — si tiene valor, el cotizador deja
  // elegir por cantidad de trozos además de por peso/monto.
  pesoPromedioTrozoGramos: number | null;
  disponibilidad: Disponibilidad;
  featured: boolean;
  lowStock: boolean;
  promoPrecioUnitario: number | null;
  promoGramosMinimos: number | null;
  promoEtiqueta: string | null;
  // Opciones de preparación por unidad (ej. "Entero,Trozado,Para la
  // parrilla"), separadas por coma — solo para productos por unidad. Si
  // tiene valor, el cotizador pide una elección por cada unidad pedida.
  opcionesUnidad: string | null;
}

export interface ComunaPublica {
  nombre: string;
  costoEnvio: number;
}

export interface CorteOpcionPublica {
  familia: string;
  nombre: string;
  orden: number;
}

// Prisma tipa unidad/disponibilidad como "string" (ver prisma/schema.prisma
// — mismo criterio que el POS, sin enums nativos). El único camino de
// escritura es /api/sync/catalogo, que ya valida estos valores con zod
// contra estas mismas uniones, así que el cast acá es seguro.
export function aProductoPublico(p: {
  idPos: number;
  plu: string;
  descripcion: string;
  nombreCorto: string | null;
  categoriaNombre: string;
  marca: string | null;
  descripcionCorta: string | null;
  precio: number;
  unidad: string;
  familiaCorte: string | null;
  pesoPromedioTrozoGramos: number | null;
  disponibilidad: string;
  featured: boolean;
  lowStock: boolean;
  promoPrecioUnitario: number | null;
  promoGramosMinimos: number | null;
  promoEtiqueta: string | null;
  opcionesUnidad: string | null;
}): ProductoPublico {
  return {
    idPos: p.idPos,
    plu: p.plu,
    descripcion: p.descripcion,
    nombreCorto: p.nombreCorto,
    categoriaNombre: p.categoriaNombre,
    marca: p.marca,
    descripcionCorta: p.descripcionCorta,
    precio: p.precio,
    unidad: p.unidad as UnidadVenta,
    familiaCorte: p.familiaCorte,
    pesoPromedioTrozoGramos: p.pesoPromedioTrozoGramos,
    disponibilidad: p.disponibilidad as Disponibilidad,
    featured: p.featured,
    lowStock: p.lowStock,
    promoPrecioUnitario: p.promoPrecioUnitario,
    promoGramosMinimos: p.promoGramosMinimos,
    promoEtiqueta: p.promoEtiqueta,
    opcionesUnidad: p.opcionesUnidad,
  };
}
