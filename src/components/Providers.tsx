"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { CatalogoDataProvider } from "@/lib/catalogoData";
import { UiProvider } from "@/lib/ui";
import type { ComunaPublica, CorteOpcionPublica, ProductoPublico } from "@/lib/types";
import type { EtiquetaPublica } from "@/lib/etiquetado/datos";

export default function Providers({
  productos,
  comunas,
  cortes,
  etiquetas,
  children,
}: {
  productos: ProductoPublico[];
  comunas: ComunaPublica[];
  cortes: CorteOpcionPublica[];
  etiquetas: EtiquetaPublica[];
  children: ReactNode;
}) {
  return (
    <CatalogoDataProvider value={{ productos, comunas, cortes, etiquetas }}>
      <CartProvider>
        <UiProvider>{children}</UiProvider>
      </CartProvider>
    </CatalogoDataProvider>
  );
}
