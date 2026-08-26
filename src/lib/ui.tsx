"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ProductoPublico } from "./types";

interface UiContextValue {
  productoCotizando: ProductoPublico | null;
  abrirCotizador: (producto: ProductoPublico) => void;
  cerrarCotizador: () => void;

  carritoAbierto: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;

  confirmarAbierto: boolean;
  abrirConfirmar: () => void;
  cerrarConfirmar: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [productoCotizando, setProductoCotizando] = useState<ProductoPublico | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  const value = useMemo<UiContextValue>(
    () => ({
      productoCotizando,
      abrirCotizador: (producto) => setProductoCotizando(producto),
      cerrarCotizador: () => setProductoCotizando(null),

      carritoAbierto,
      abrirCarrito: () => setCarritoAbierto(true),
      cerrarCarrito: () => setCarritoAbierto(false),

      confirmarAbierto,
      abrirConfirmar: () => {
        setCarritoAbierto(false);
        setConfirmarAbierto(true);
      },
      cerrarConfirmar: () => setConfirmarAbierto(false),
    }),
    [productoCotizando, carritoAbierto, confirmarAbierto]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi debe usarse dentro de <UiProvider>");
  return ctx;
}
