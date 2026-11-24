"use client";

import { useMemo, useState } from "react";
import { optimizarImagen } from "@/lib/imagen";
import { quitarFoto, subirFoto } from "./acciones";

export interface ProductoFoto {
  idPos: number;
  descripcion: string;
  categoria: string;
  fotoSubida: string | null;
  fotoAutomatica: string | null;
}

type Filtro = "todos" | "sin-foto" | "subidas";

// Lado mayor máximo de la foto — las tarjetas de la web la muestran a
// ~300 px de ancho, 1000 px deja margen para pantallas de alta densidad.
const LADO_MAX = 1000;

export default function GaleriaFotos({ productos }: { productos: ProductoFoto[] }) {
  const [subidas, setSubidas] = useState<Record<number, string | null>>(() =>
    Object.fromEntries(productos.map((p) => [p.idPos, p.fotoSubida]))
  );
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [errores, setErrores] = useState<Record<number, string>>({});

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const subida = subidas[p.idPos];
      if (filtro === "sin-foto" && (subida || p.fotoAutomatica)) return false;
      if (filtro === "subidas" && !subida) return false;
      return !q || `${p.descripcion} ${p.categoria}`.toLowerCase().includes(q);
    });
  }, [productos, subidas, filtro, busqueda]);

  const sinFoto = productos.filter((p) => !subidas[p.idPos] && !p.fotoAutomatica).length;

  async function alElegir(idPos: number, archivo: File | undefined) {
    if (!archivo) return;
    setOcupado(idPos);
    setErrores((e) => ({ ...e, [idPos]: "" }));
    try {
      const optimizada = await optimizarImagen(archivo, LADO_MAX);
      const fd = new FormData();
      fd.set("idPos", String(idPos));
      fd.set("foto", optimizada);
      const r = await subirFoto(fd);
      if (r.ok) setSubidas((s) => ({ ...s, [idPos]: r.url }));
      else setErrores((e) => ({ ...e, [idPos]: r.error }));
    } catch (err) {
      setErrores((e) => ({ ...e, [idPos]: err instanceof Error ? err.message : "No se pudo subir la foto" }));
    } finally {
      setOcupado(null);
    }
  }

  async function alQuitar(idPos: number) {
    if (!confirm("¿Quitar la foto subida? La web vuelve a mostrar la foto automática (si hay).")) return;
    setOcupado(idPos);
    const r = await quitarFoto(idPos);
    if (r.ok) setSubidas((s) => ({ ...s, [idPos]: null }));
    setOcupado(null);
  }

  const chip = (valor: Filtro, texto: string) => (
    <button
      type="button"
      onClick={() => setFiltro(valor)}
      className={`rounded-full px-3 py-1.5 text-sm ${filtro === valor ? "bg-accent text-background" : "border border-card-border bg-card"}`}
    >
      {texto}
    </button>
  );

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        {chip("todos", `Todos (${productos.length})`)}
        {chip("sin-foto", `Sin foto (${sinFoto})`)}
        {chip("subidas", "Subidas aquí")}
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto…"
          className="ml-auto w-full rounded-lg border border-card-border bg-white px-3 py-2 sm:w-64"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visibles.map((p) => {
          const subida = subidas[p.idPos];
          const foto = subida ?? p.fotoAutomatica;
          const cargando = ocupado === p.idPos;
          return (
            <div key={p.idPos} className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
              <div className="relative aspect-[4/5] bg-surface">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto} alt={p.descripcion} className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">Sin foto</div>
                )}
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    subida ? "bg-accent text-background" : foto ? "bg-white/90 text-dark" : "bg-offer text-background"
                  }`}
                >
                  {subida ? "Subida" : foto ? "Automática" : "Falta"}
                </span>
                {cargando && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-dark">
                    Subiendo…
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div>
                  <p className="text-sm font-semibold leading-tight text-dark">{p.descripcion}</p>
                  <p className="text-xs text-muted">{p.categoria}</p>
                </div>
                <label
                  className={`mt-auto cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-bold text-background ${
                    ocupado != null ? "pointer-events-none bg-muted" : "bg-accent"
                  }`}
                >
                  {foto ? "Cambiar foto" : "Subir foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={ocupado != null}
                    onChange={(e) => {
                      alElegir(p.idPos, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {subida && (
                  <button type="button" onClick={() => alQuitar(p.idPos)} disabled={ocupado != null} className="text-xs text-offer underline">
                    Quitar foto subida
                  </button>
                )}
                {errores[p.idPos] && <p className="text-xs text-offer">{errores[p.idPos]}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {visibles.length === 0 && <p className="mt-6 text-sm text-muted">No hay productos con ese filtro.</p>}
    </div>
  );
}
