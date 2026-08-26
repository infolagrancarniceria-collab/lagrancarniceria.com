"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface ItemCarrito {
  idPos: number;
  descripcion: string;
  corte: string | null;
  precio: number;
  unidad: "kg" | "unidad";
  cantidad: number;
}

function claveItem(idPos: number, corte: string | null): string {
  return `${idPos}::${corte ?? "sin-corte"}`;
}

interface CartContextValue {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad: number) => void;
  actualizarCantidad: (idPos: number, corte: string | null, cantidad: number) => void;
  quitar: (idPos: number, corte: string | null) => void;
  vaciar: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lgc-carrito";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargado, setCargado] = useState(false);

  // Se carga solo en el navegador (localStorage no existe en el servidor) —
  // por eso el carrito arranca vacío y se rellena después del primer render.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(STORAGE_KEY);
      // Hidratación única desde localStorage (un sistema externo) al montar
      // — no dispara un loop de renders, es la lectura inicial de carrito
      // guardado en el navegador. SSR no puede hacer esto (no hay
      // localStorage en el servidor), por eso va en efecto y no en el
      // useState inicial.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (guardado) setItems(JSON.parse(guardado));
    } catch {
      // localStorage no disponible (ej. modo privado) — el carrito sigue
      // funcionando en memoria durante la sesión, solo no persiste.
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ver comentario arriba
    }
  }, [items, cargado]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      agregar: (item, cantidad) => {
        setItems((actual) => {
          const clave = claveItem(item.idPos, item.corte);
          const existente = actual.find((i) => claveItem(i.idPos, i.corte) === clave);
          if (existente) {
            return actual.map((i) =>
              claveItem(i.idPos, i.corte) === clave ? { ...i, cantidad: i.cantidad + cantidad } : i
            );
          }
          return [...actual, { ...item, cantidad }];
        });
      },
      actualizarCantidad: (idPos, corte, cantidad) => {
        setItems((actual) =>
          actual
            .map((i) => (claveItem(i.idPos, i.corte) === claveItem(idPos, corte) ? { ...i, cantidad } : i))
            .filter((i) => i.cantidad > 0)
        );
      },
      quitar: (idPos, corte) => {
        setItems((actual) => actual.filter((i) => claveItem(i.idPos, i.corte) !== claveItem(idPos, corte)));
      },
      vaciar: () => setItems([]),
      totalItems: items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
