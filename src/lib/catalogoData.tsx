"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ComunaPublica, CorteOpcionPublica, ProductoPublico } from "./types";

interface CatalogoDataValue {
  productos: ProductoPublico[];
  comunas: ComunaPublica[];
  cortes: CorteOpcionPublica[];
}

const CatalogoDataContext = createContext<CatalogoDataValue | null>(null);

export function CatalogoDataProvider({ value, children }: { value: CatalogoDataValue; children: ReactNode }) {
  return <CatalogoDataContext.Provider value={value}>{children}</CatalogoDataContext.Provider>;
}

export function useCatalogoData(): CatalogoDataValue {
  const ctx = useContext(CatalogoDataContext);
  if (!ctx) throw new Error("useCatalogoData debe usarse dentro de <CatalogoDataProvider>");
  return ctx;
}

export function opcionesCorte(cortes: CorteOpcionPublica[], familia: string | null): string[] {
  if (!familia) return [];
  return cortes
    .filter((c) => c.familia === familia)
    .sort((a, b) => a.orden - b.orden)
    .map((c) => c.nombre);
}

// "Entero,Trozado, Para la parrilla" -> ["Entero", "Trozado", "Para la parrilla"]
export function opcionesUnidad(valor: string | null): string[] {
  if (!valor) return [];
  return valor
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
