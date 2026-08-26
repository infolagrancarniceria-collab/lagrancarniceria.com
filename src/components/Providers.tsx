"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { CatalogoDataProvider } from "@/lib/catalogoData";
import { UiProvider } from "@/lib/ui";
import type { ComunaPublica, CorteOpcionPublica, ProductoPublico } from "@/lib/types";

export default function Providers({
  productos,
  comunas,
  cortes,
  children,
}: {
  productos: ProductoPublico[];
  comunas: ComunaPublica[];
  cortes: CorteOpcionPublica[];
  children: ReactNode;
}) {
  return (
    <CatalogoDataProvider value={{ productos, comunas, cortes }}>
      <CartProvider>
        <UiProvider>{children}</UiProvider>
      </CartProvider>
    </CatalogoDataProvider>
  );
}
