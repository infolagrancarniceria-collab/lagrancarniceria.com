"use client";

import { useState } from "react";
import { optimizarImagen } from "@/lib/imagen";
import { CAMPOS_DISENO, type CampoDiseno, type PosicionesCampos } from "@/lib/etiquetado/diseno";
import { guardarPosiciones, quitarDiseno, subirDiseno } from "./accionesDiseno";

// 2400 px de lado mayor: una etiqueta de 12 cm queda sobre 500 dpi, más
// que suficiente para una impresora de tinta.
const LADO_MAX = 2400;

export default function EditorDiseno({
  productoId,
  url: urlInicial,
  posiciones: posicionesIniciales,
  anchoCm,
  altoCm,
}: {
  productoId: number;
  url: string | null;
  posiciones: PosicionesCampos;
  anchoCm: number | null;
  altoCm: number | null;
}) {
  const [url, setUrl] = useState(urlInicial);
  const [posiciones, setPosiciones] = useState<PosicionesCampos>(posicionesIniciales);
  const [ubicando, setUbicando] = useState<CampoDiseno | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [proporcion, setProporcion] = useState<number | null>(null);

  async function alElegir(archivo: File | undefined) {
    if (!archivo) return;
    setOcupado(true);
    setMensaje(null);
    try {
      const fd = new FormData();
      fd.set("productoId", String(productoId));
      fd.set("diseno", await optimizarImagen(archivo, LADO_MAX, 0.92));
      const r = await subirDiseno(fd);
      if (r.ok) setUrl(r.url);
      else setMensaje(r.error);
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "No se pudo subir el diseño");
    } finally {
      setOcupado(false);
    }
  }

  async function guardar(nuevas: PosicionesCampos) {
    setPosiciones(nuevas);
    await guardarPosiciones(productoId, JSON.stringify(nuevas));
    setMensaje("Posiciones guardadas");
  }

  const proporcionEtiqueta = anchoCm && altoCm ? anchoCm / altoCm : null;
  const desajuste =
    proporcion && proporcionEtiqueta ? Math.abs(proporcion - proporcionEtiqueta) / proporcionEtiqueta > 0.03 : false;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-dark">Diseño de la cara principal</h2>
      <p className="text-sm text-muted">
        Sube el diseño hecho en Canva (PNG o JPG, al tamaño de la etiqueta). La etiqueta lo usa de fondo y le pone encima los
        sellos &quot;ALTO EN&quot; en el cuadrante superior derecho, y los campos variables donde los ubiques.
      </p>

      <div className="mt-3 rounded-xl border border-card-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-background ${ocupado ? "pointer-events-none bg-muted" : "bg-accent"}`}
          >
            {ocupado ? "Subiendo…" : url ? "Cambiar diseño" : "Subir diseño"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                alElegir(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {url && (
            <button
              type="button"
              className="text-sm text-offer underline"
              onClick={async () => {
                if (!confirm("¿Quitar el diseño? La etiqueta vuelve al formato simple.")) return;
                const r = await quitarDiseno(productoId);
                if (r.ok) setUrl(null);
              }}
            >
              Quitar diseño
            </button>
          )}
          {mensaje && <span className="text-sm text-dark">{mensaje}</span>}
        </div>

        {url && (
          <>
            {desajuste && anchoCm && altoCm && (
              <p className="mt-3 rounded-lg border border-gold bg-surface p-2 text-sm">
                La proporción del diseño no coincide con la etiqueta configurada ({anchoCm} × {altoCm} cm): se va a deformar.
                Ajusta el ancho/alto arriba o exporta el diseño a ese tamaño.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Ubicar campo:</span>
              {CAMPOS_DISENO.map((c) => (
                <button
                  key={c.clave}
                  type="button"
                  onClick={() => setUbicando(ubicando === c.clave ? null : c.clave)}
                  className={`rounded-full px-3 py-1 ${
                    ubicando === c.clave ? "bg-accent text-background" : "border border-card-border bg-white"
                  }`}
                >
                  {c.etiqueta} {posiciones[c.clave] ? "✓" : ""}
                </button>
              ))}
              {Object.keys(posiciones).length > 0 && (
                <button type="button" className="text-xs text-offer underline" onClick={() => guardar({})}>
                  Borrar posiciones
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              {ubicando
                ? `Haz clic sobre el diseño donde debe empezar "${CAMPOS_DISENO.find((c) => c.clave === ubicando)?.etiqueta}" (sobre la línea).`
                : "Elige un campo y haz clic en el diseño donde va su valor. Los campos sin ubicar no se imprimen en el frente (igual van en la cara de información)."}
            </p>

            <div
              className={`relative mt-3 max-w-xl select-none overflow-hidden rounded border border-card-border ${ubicando ? "cursor-crosshair" : ""}`}
              onClick={(e) => {
                if (!ubicando) return;
                const r = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 10;
                const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 10;
                guardar({ ...posiciones, [ubicando]: { x, y } });
                setUbicando(null);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Diseño de la cara principal"
                className="block w-full"
                onLoad={(e) => setProporcion(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
              />
              <div
                className="pointer-events-none absolute right-0 top-0 flex h-1/2 w-1/2 items-start justify-end border-b-2 border-l-2 border-dashed border-offer/70 bg-offer/10 p-1 text-[10px] font-bold text-offer"
                title="Cuadrante superior derecho"
              >
                zona de sellos
              </div>
              {CAMPOS_DISENO.map(({ clave, etiqueta }) => {
                const p = posiciones[clave];
                if (!p) return null;
                return (
                  <span
                    key={clave}
                    className="pointer-events-none absolute -translate-y-full rounded bg-accent px-1 text-[10px] font-bold text-background"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    {etiqueta}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
