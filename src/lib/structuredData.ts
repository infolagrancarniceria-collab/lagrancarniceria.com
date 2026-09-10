import { NEGOCIO_NOMBRE, SITIO_URL } from "@/lib/negocio";
import { imagenProducto } from "@/lib/imagenesProductos";
import type { ProductoPublico } from "@/lib/types";

const DISPONIBILIDAD_SCHEMA: Record<ProductoPublico["disponibilidad"], string> = {
  disponible: "https://schema.org/InStock",
  agotado: "https://schema.org/OutOfStock",
  proximamente: "https://schema.org/PreOrder",
};

// Datos estructurados (schema.org/Product) para que Google y los buscadores
// con IA puedan leer el precio y la disponibilidad de cada producto
// directamente, en vez de tener que adivinarlos del texto de la página. El
// catálogo es de una sola página (sin URL propia por producto), así que se
// arma como un ItemList y el Offer.url de cada producto apunta a la sección
// del catálogo, no a una ficha propia — sigue siendo válido para schema.org,
// solo que menos preciso que una URL única por producto.
export function construirJsonLdProductos(productos: ProductoPublico[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: productos.map((p, i) => {
      const foto = imagenProducto(p);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.descripcion,
          description: p.descripcionCorta ?? p.descripcion,
          sku: p.plu,
          category: p.categoriaNombre,
          brand: { "@type": "Brand", name: p.marca ?? NEGOCIO_NOMBRE },
          ...(foto ? { image: `${SITIO_URL}${foto}` } : {}),
          offers: {
            "@type": "Offer",
            url: `${SITIO_URL}/#catalogo`,
            priceCurrency: "CLP",
            price: String(p.precio),
            availability: DISPONIBILIDAD_SCHEMA[p.disponibilidad],
          },
        },
      };
    }),
  };
}
