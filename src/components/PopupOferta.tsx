"use client";

import { useEffect, useState } from "react";
import { useCatalogoData } from "@/lib/catalogoData";
import { formatoCLP } from "@/lib/format";

const STORAGE_KEY = "lgc-popup-oferta-visto";

// El producto en oferta viene del catálogo sincronizado (no hardcodeado como
// en el prompt original) — así el popup siempre refleja la promo real
// vigente en el POS, aunque cambie de un producto a otro.
export default function PopupOferta() {
  const { productos } = useCatalogoData();
  const [visible, setVisible] = useState(false);

  const oferta = productos.find((p) => p.disponibilidad === "disponible" && p.promoPrecioUnitario != null && p.promoEtiqueta);

  useEffect(() => {
    if (!oferta) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sessionStorage no disponible — se muestra igual, solo no recuerda el descarte
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oferta?.idPos]);

  function cerrar() {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ver comentario arriba
    }
  }

  if (!visible || !oferta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={cerrar}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: "var(--offer)", color: "var(--background)" }}
        >
          Oferta
        </span>
        <h3 className="mt-3 font-display text-2xl text-dark">{oferta.descripcion}</h3>
        <p className="mt-2 text-sm text-muted">
          {formatoCLP(oferta.precio)}
          {oferta.unidad === "kg" ? "/kg" : "/unidad"} regular · {oferta.promoEtiqueta}
        </p>
        <button
          type="button"
          onClick={() => {
            cerrar();
            document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-5 w-full rounded-lg py-3 text-sm font-semibold transition-colors duration-300"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          Ver catálogo
        </button>
      </div>
    </div>
  );
}
