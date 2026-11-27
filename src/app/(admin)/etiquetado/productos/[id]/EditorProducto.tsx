"use client";

import { startTransition, useActionState, useMemo, useState } from "react";
import {
  calcular,
  formatoEntero,
  formatoG,
  gramosItem,
  textoIngredientes,
  TEXTO_SELLO,
  type IngredienteCalculo,
  type ItemReceta,
  type UnidadCantidad,
} from "@/lib/etiquetado/calculo";
import TablaNutricional from "@/components/etiquetado/TablaNutricional";
import SelloAltoEn from "@/components/etiquetado/SelloAltoEn";
import { guardarProducto, type EstadoForm } from "../../acciones";

const UNIDADES: UnidadCantidad[] = ["g", "kg", "ml", "l", "unidad"];
const input = "rounded-lg border border-card-border bg-white px-3 py-2";

export interface ProductoEditable {
  id: number;
  nombre: string;
  kgBase: number;
  mermaPct: number;
  salmueraAbsorbidaPct: number | null;
  porcionG: number;
  porcionMedidaCasera: string;
  vidaUtilDias: number | null;
  almacenamiento: string | null;
  instruccionesUso: string | null;
  leyendaAdicional: string | null;
  etiquetaAnchoCm: number | null;
  etiquetaAltoCm: number | null;
  sellosVertical: boolean;
  idPosWeb: number | null;
  publicarEnWeb: boolean;
  items: ItemReceta[];
}

// Acepta "2,5" o "2.5".
function n(s: string): number {
  const t = s.trim();
  return Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
}

type Fila = {
  clave: number;
  ingredienteId: number;
  cantidad: string;
  unidad: UnidadCantidad;
  porKgBase: boolean;
  enSalmuera: boolean;
};

let siguienteClave = 1;

export default function EditorProducto({
  producto: p,
  ingredientes,
  catalogo,
}: {
  producto: ProductoEditable | null;
  ingredientes: IngredienteCalculo[];
  catalogo: { idPos: number; descripcion: string }[];
}) {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(guardarProducto, { error: null });
  const mapa = useMemo(() => new Map(ingredientes.map((i) => [i.id, i])), [ingredientes]);

  const [kgBase, setKgBase] = useState(String(p?.kgBase ?? 1).replace(".", ","));
  const [merma, setMerma] = useState(String(p?.mermaPct ?? 0).replace(".", ","));
  const [porcion, setPorcion] = useState(String(p?.porcionG ?? 100).replace(".", ","));
  const [filas, setFilas] = useState<Fila[]>(() =>
    (p?.items ?? []).map((it) => ({
      clave: siguienteClave++,
      ingredienteId: it.ingredienteId,
      cantidad: String(it.cantidad).replace(".", ","),
      unidad: it.unidad,
      porKgBase: it.porKgBase,
      enSalmuera: !!it.enSalmuera,
    }))
  );
  const [salmueraPct, setSalmueraPct] = useState(
    p?.salmueraAbsorbidaPct == null ? "" : String(p.salmueraAbsorbidaPct).replace(".", ",")
  );

  const items: ItemReceta[] = filas
    .filter((f) => f.ingredienteId > 0 && n(f.cantidad) > 0)
    .map((f) => ({
      ingredienteId: f.ingredienteId,
      cantidad: n(f.cantidad),
      unidad: f.unidad,
      porKgBase: f.porKgBase,
      enSalmuera: f.enSalmuera,
    }));
  const haySalmuera = filas.some((f) => f.enSalmuera);

  const kg = n(kgBase) || 0;
  // Cálculo barato (decenas de ingredientes): se rehace en cada render.
  const r = calcular(
    {
      kgBase: kg,
      mermaPct: n(merma) || 0,
      porcionG: n(porcion) || 0,
      salmueraAbsorbidaPct: salmueraPct.trim() === "" ? null : n(salmueraPct) || 0,
      items,
    },
    mapa
  );

  const cambiar = (clave: number, cambio: Partial<Fila>) =>
    setFilas((fs) => fs.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));
  const mover = (i: number, d: -1 | 1) =>
    setFilas((fs) => {
      const j = i + d;
      if (j < 0 || j >= fs.length) return fs;
      const copia = [...fs];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });

  const gramosPorFila = (f: Fila) => {
    const ing = mapa.get(f.ingredienteId);
    const cantidad = n(f.cantidad);
    if (!ing || !(cantidad > 0)) return null;
    return gramosItem({ ingredienteId: ing.id, cantidad, unidad: f.unidad, porKgBase: f.porKgBase }, ing, kg);
  };

  return (
    // onSubmit en vez de action={...}: con action, React 19 resetea el
    // formulario al terminar y los <select> controlados de la receta
    // quedarían mostrando la primera opción aunque el estado siga bien.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => accion(fd));
      }}
      className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]"
    >
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="flex min-w-0 flex-col gap-5">
        <fieldset className="grid gap-3 rounded-xl border border-card-border bg-card p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-bold text-dark">Producto</legend>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Nombre del alimento (como va en el rótulo)
            <input name="nombre" defaultValue={p?.nombre} required className={input} placeholder="ej. Longaniza picante ahumada" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Porción de consumo habitual (g)
            <input name="porcionG" value={porcion} onChange={(e) => setPorcion(e.target.value)} required inputMode="decimal" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Porción en medida casera
            <input name="porcionMedidaCasera" defaultValue={p?.porcionMedidaCasera ?? "1 unidad"} required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Merma típica del proceso (%)
            <input name="mermaPct" value={merma} onChange={(e) => setMerma(e.target.value)} required inputMode="decimal" className={input} />
            <span className="text-xs text-muted">0 si se vende crudo. Cada lote puede registrar su merma real.</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Vida útil (días)
            <input name="vidaUtilDias" defaultValue={p?.vidaUtilDias ?? ""} inputMode="numeric" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Instrucciones de almacenamiento
            <input name="almacenamiento" defaultValue={p?.almacenamiento ?? ""} className={input} placeholder="ej. Mantener refrigerado entre 0 °C y 4 °C." />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Instrucciones de uso
            <input name="instruccionesUso" defaultValue={p?.instruccionesUso ?? ""} className={input} placeholder="ej. Cocinar completamente antes de consumir." />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Leyenda adicional (opcional)
            <input name="leyendaAdicional" defaultValue={p?.leyendaAdicional ?? ""} className={input} placeholder='ej. "Puede contener trazas de ..."' />
          </label>
        </fieldset>

        <fieldset className="rounded-xl border border-card-border bg-card p-4">
          <legend className="px-1 text-sm font-bold text-dark">Receta</legend>
          <label className="flex max-w-xs flex-col gap-1 text-sm">
            Kg de base del lote (ej. carne)
            <input name="kgBase" value={kgBase} onChange={(e) => setKgBase(e.target.value)} required inputMode="decimal" className={input} />
          </label>
          <p className="mt-1 text-xs text-muted">
            &quot;Por kg de base&quot; multiplica la cantidad por estos kg (ej. sal 16 g/kg). Desmárcalo para ingresar la cantidad total
            del lote. La tripa natural no se incluye.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {filas.map((f, i) => {
              const g = gramosPorFila(f);
              return (
                <div key={f.clave} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg bg-surface p-2 sm:grid-cols-[minmax(0,1fr)_90px_90px_auto_auto]">
                  <select
                    value={f.ingredienteId}
                    onChange={(e) => cambiar(f.clave, { ingredienteId: Number(e.target.value) })}
                    className={`${input} col-span-2 min-w-0 sm:col-span-1`}
                  >
                    <option value={0}>— Elegir ingrediente —</option>
                    {ingredientes.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    value={f.cantidad}
                    onChange={(e) => cambiar(f.clave, { cantidad: e.target.value })}
                    inputMode="decimal"
                    aria-label="Cantidad"
                    className={`${input} tabular`}
                  />
                  <select value={f.unidad} onChange={(e) => cambiar(f.clave, { unidad: e.target.value as UnidadCantidad })} className={input}>
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col justify-center gap-0.5 text-xs">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={f.porKgBase} onChange={(e) => cambiar(f.clave, { porKgBase: e.target.checked })} />
                      por kg de base
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={f.enSalmuera} onChange={(e) => cambiar(f.clave, { enSalmuera: e.target.checked })} />
                      en salmuera
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    <span className="tabular mr-2 text-muted">
                      {g == null ? "" : f.enSalmuera ? `${formatoEntero(g)} g en salmuera` : `${formatoEntero(g)} g`}
                    </span>
                    <button type="button" onClick={() => mover(i, -1)} className="px-1" aria-label="Subir">
                      ↑
                    </button>
                    <button type="button" onClick={() => mover(i, 1)} className="px-1" aria-label="Bajar">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilas((fs) => fs.filter((x) => x.clave !== f.clave))}
                      className="px-1 text-offer"
                      aria-label="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border border-card-border p-3">
            <label className="flex max-w-xs flex-col gap-1 text-sm">
              Salmuera absorbida (% del peso de la base)
              <input
                name="salmueraAbsorbidaPct"
                value={salmueraPct}
                onChange={(e) => setSalmueraPct(e.target.value)}
                inputMode="decimal"
                className={input}
                placeholder="vacío si no lleva salmuera"
              />
            </label>
            <p className="mt-1 text-xs text-muted">
              Para jamones y piezas curadas en salmuera: marca &quot;en salmuera&quot; en sus ingredientes (ej. 1000 ml de agua + 55 g de
              sal = la composición de la salmuera) e indica qué % del peso de la carne quedó dentro: lo inyectado más lo que ganó al
              sumergirla. Se mide pesando la pieza antes de inyectar y después de sacarla de la salmuera (escurrida). Solo entra al
              producto esa parte de la salmuera, no toda la preparada.
            </p>
            {haySalmuera && r.salmuera && (
              <p className="tabular mt-1 text-xs text-dark">
                Salmuera preparada: {formatoEntero(r.salmuera.preparadaG)} g → absorbida: {formatoEntero(r.salmuera.absorbidaG)} g
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setFilas((fs) => [
                ...fs,
                { clave: siguienteClave++, ingredienteId: 0, cantidad: "", unidad: "g", porKgBase: true, enSalmuera: false },
              ])
            }
            className="mt-3 rounded-lg border border-accent px-3 py-1.5 text-sm font-semibold text-accent"
          >
            + Agregar ingrediente
          </button>
        </fieldset>

        <fieldset className="grid gap-3 rounded-xl border border-card-border bg-card p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-bold text-dark">Etiqueta y web</legend>
          <label className="flex flex-col gap-1 text-sm">
            Ancho de la cara principal (cm)
            <input name="etiquetaAnchoCm" defaultValue={p?.etiquetaAnchoCm ?? ""} inputMode="decimal" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Alto de la cara principal (cm)
            <input name="etiquetaAltoCm" defaultValue={p?.etiquetaAltoCm ?? ""} inputMode="decimal" className={input} />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="sellosVertical" defaultChecked={p?.sellosVertical} />
            Sellos en columna (uno bajo otro) en vez de en fila. Útil para etiquetas angostas y altas.
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Producto del catálogo web
            <select name="idPosWeb" defaultValue={p?.idPosWeb ?? ""} className={input}>
              <option value="">— Ninguno —</option>
              {catalogo.map((c) => (
                <option key={c.idPos} value={c.idPos}>
                  {c.descripcion}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="publicarEnWeb" defaultChecked={p?.publicarEnWeb} />
            Mostrar la información nutricional en la ficha del producto en la web
          </label>
        </fieldset>

        <div className="flex items-center gap-3">
          <button disabled={pendiente} className="rounded-lg bg-accent px-5 py-2 font-bold text-background disabled:opacity-60">
            {pendiente ? "Guardando…" : "Guardar producto"}
          </button>
          {estado.error && <span className="text-sm text-offer">{estado.error}</span>}
          {estado.ok && <span className="text-sm text-dark">{estado.ok}</span>}
        </div>
      </div>

      {/* Vista previa en vivo */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-xl border border-card-border bg-card p-4 text-sm">
          <h2 className="font-bold text-dark">Resultado (merma típica)</h2>
          <p className="tabular mt-1 text-xs text-muted">
            Peso crudo {formatoEntero(r.pesoCrudoG)} g → final {formatoEntero(r.pesoFinalG)} g
          </p>
          <div className="mt-3">
            <TablaNutricional
              porcionG={n(porcion) || 0}
              porcionMedidaCasera="Porción"
              porcionesEnvase={null}
              por100={r.por100}
              porPorcion={r.porPorcion}
              desglosarGrasas={r.desglosarGrasas}
              escala={1.25}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.sellosQueCorresponden.map((s) => (
              <SelloAltoEn key={s} sello={s} tamano="64px" />
            ))}
            {r.sellosQueCorresponden.length === 0 && <span className="text-xs">No corresponde ningún sello.</span>}
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 text-xs">
          <h3 className="text-sm font-bold text-dark">¿Por qué estos sellos?</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {r.sellos.map((s) => (
              <li key={s.sello}>
                <b>{TEXTO_SELLO[s.sello]}:</b>{" "}
                {s.sello === "sodio" || s.sello === "calorias" ? formatoEntero(s.valorPor100) : formatoG(s.valorPor100)} /{" "}
                {s.limite} por 100 g {s.supera ? "(supera)" : "(no supera)"} ·{" "}
                {s.adicionado ? `adicionado por ${s.ingredientesQueAdicionan.join(", ")}` : "sin adición"} →{" "}
                <b>{s.corresponde ? "LLEVA SELLO" : "no lleva"}</b>
              </li>
            ))}
          </ul>
          {r.sellos.some((s) => s.supera && !s.adicionado) && (
            <p className="mt-2 text-muted">
              Supera un límite sin adición del nutriente: hoy no corresponde sello, pero si se agrega un ingrediente que lo adicione
              (ej. tocino, azúcar), pasa a corresponder.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 text-xs">
          <h3 className="text-sm font-bold text-dark">Ingredientes (rótulo)</h3>
          <p className="mt-1">{r.lineas.length ? textoIngredientes(r.lineas) : "—"}</p>
          {r.advertencias.map((a) => (
            <p key={a} className="mt-2 text-offer">
              {a}
            </p>
          ))}
        </div>
      </aside>
    </form>
  );
}
