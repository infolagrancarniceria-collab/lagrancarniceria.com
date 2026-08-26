"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useUi } from "@/lib/ui";

const NAV = [
  { href: "#catalogo", label: "Catálogo" },
  { href: "#historia", label: "Historia" },
  { href: "#despacho", label: "Despacho" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
  { href: "#resenas", label: "Reseñas" },
];

export default function Header() {
  const { totalItems } = useCart();
  const { abrirCarrito } = useUi();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background" style={{ borderBottom: "1px solid var(--card-border)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#" className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm text-dark"
            style={{ border: "2px solid var(--gold)", background: "var(--card)" }}
          >
            LGC
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg text-dark">La Gran Carnicería</span>
            <span className="text-xs text-muted">Lun a Dom, 9:00–15:00</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-text lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors duration-300 hover:text-accent">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={abrirCarrito}
            className="relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
            style={{ background: "var(--accent)", color: "var(--background)" }}
          >
            Mi pedido
            {totalItems > 0 && (
              <span
                className="tabular absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold"
                style={{ background: "var(--offer)", color: "var(--background)" }}
              >
                {totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-dark lg:hidden"
            style={{ border: "1px solid var(--card-border)" }}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav className="flex flex-col gap-1 px-4 pb-4 text-sm font-medium text-text lg:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setMenuAbierto(false)}
              className="rounded-lg px-3 py-2 hover:bg-surface"
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
