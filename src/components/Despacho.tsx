"use client";

import { useCatalogoData } from "@/lib/catalogoData";
import { formatoCLP } from "@/lib/format";

export default function Despacho() {
  const { comunas } = useCatalogoData();

  return (
    <section id="despacho" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Despacho</h2>

      <div
        className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold"
        style={{ background: "var(--accent)", color: "var(--background)" }}
      >
        Los primeros 5 pedidos antes de las 15:00 se despachan el mismo día · el resto, y los de después de las
        16:00, al día siguiente · domingos sin despacho
      </div>

      <p className="mt-4 text-sm text-muted">
        Todo pedido queda sujeto a confirmación manual por WhatsApp. Precios y stock referenciales, sujetos a
        confirmación por WhatsApp.
      </p>

      {comunas.length === 0 ? (
        <p className="mt-6 rounded-lg bg-card p-6 text-muted" style={{ border: "1px solid var(--card-border)" }}>
          Las tarifas de despacho todavía no están publicadas.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {comunas.map((c) => (
            <li
              key={c.nombre}
              className="flex items-center justify-between rounded-xl bg-card px-5 py-3"
              style={{ border: "1px solid var(--card-border)" }}
            >
              <span className="text-text">{c.nombre}</span>
              <span className="tabular font-sans font-semibold text-accent">
                {c.costoEnvio === 0 ? "Gratis" : formatoCLP(c.costoEnvio)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-muted">¿Tu comuna no aparece? Escríbenos por WhatsApp y lo confirmamos.</p>
    </section>
  );
}
