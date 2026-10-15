"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

  // Con algún overlay (cotizador/carrito/confirmar) abierto, se congela el
  // scroll del fondo — si no, en mobile el navegador se confunde sobre qué
  // contenedor scrollear al enfocar un campo y aparecer el teclado (el
  // fondo "de atrás" se mueve en vez del formulario), dejando campos del
  // overlay inalcanzables aunque sigan ahí. Se fija el body en su posición
  // actual (no solo overflow:hidden, que iOS Safari ignora al tocar y
  // arrastrar) y se restaura el scroll exacto al cerrar.
  const overlayAbierto = carritoAbierto || confirmarAbierto || productoCotizando !== null;
  useEffect(() => {
    if (!overlayAbierto) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const originalPosition = style.position;
    const originalTop = style.top;
    const originalWidth = style.width;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    return () => {
      style.position = originalPosition;
      style.top = originalTop;
      style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [overlayAbierto]);

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
