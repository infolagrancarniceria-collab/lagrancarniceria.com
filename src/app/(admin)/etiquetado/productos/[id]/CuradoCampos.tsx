"use client";

import { PARAMETROS_SUPUESTOS, type CamposCurado } from "@/lib/etiquetado/curadoForm";

const input = "rounded-lg border border-card-border bg-white px-3 py-2";

// Parámetros del modelo de curado por inmersión + hoja de supuestos. Los
// valores se envían con el formulario del producto (inputs con name).
export default function CuradoCampos({
  campos: c,
  onChange,
}: {
  campos: CamposCurado;
  onChange: (c: CamposCurado) => void;
}) {
  const set = (cambio: Partial<CamposCurado>) => onChange({ ...c, ...cambio });
  const campo = (name: keyof CamposCurado, etiqueta: string, ayuda?: string) => (
    <label className="flex flex-col gap-1 text-sm">
      {etiqueta}
      <input
        name={name}
        value={c[name] as string}
        onChange={(e) => set({ [name]: e.target.value } as Partial<CamposCurado>)}
        inputMode="decimal"
        className={input}
      />
      {ayuda && <span className="text-xs text-muted">{ayuda}</span>}
    </label>
  );

  return (
    <fieldset className="rounded-xl border border-card-border bg-card p-4">
      <legend className="px-1 text-sm font-bold text-dark">Curado en salmuera (modelo de equilibrio)</legend>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="curadoActivo" checked={c.curadoActivo} onChange={(e) => set({ curadoActivo: e.target.checked })} />
        Producto curado por inmersión en salmuera (reemplaza a &quot;salmuera absorbida %&quot;)
      </label>
      <p className="mt-1 text-xs text-muted">
        La sal de toda la salmuera de la tanda se reparte entre el agua de la salmuera y el agua de toda la carne → concentración de
        equilibrio. Cada pieza alcanza una fracción de ese equilibrio según su grosor; la sal entra en el agua del tejido, no en la
        grasa. Los ingredientes marcados &quot;en salmuera&quot; definen la composición por litro.
      </p>

      {c.curadoActivo && (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {campo("tandaLitros", "Salmuera de la tanda (L)")}
            {campo("tandaKgCarne", "Carne de la tanda (kg, todos los productos)")}
            {campo("tandaAguaCarnePct", "Agua promedio de esa carne (%)", "≈65 % en cortes magros/medios")}
            {campo("fraccionEqMin", "Fracción de equilibrio mín.", "Delgadas 0,7–0,9 · medianas 0,5–0,7 · grandes 0,25–0,4")}
            {campo("fraccionEqMax", "Fracción de equilibrio máx.")}
            {campo("enjuaguePct", "Sal perdida en el enjuague (%)")}
            {campo("factorAzucarMin", "Azúcar vs sal, mín.", "El azúcar difunde más lento")}
            {campo("factorAzucarMax", "Azúcar vs sal, máx.")}
            <label className="flex flex-col gap-1 text-sm">
              Inyección
              <select
                name="inyeccion"
                value={c.inyeccion}
                onChange={(e) => set({ inyeccion: e.target.value as CamposCurado["inyeccion"] })}
                className={input}
              >
                <option value="no">No se inyecta</option>
                <option value="si">Sí se inyecta</option>
                <option value="pendiente">Pendiente (el rango considera ambas)</option>
              </select>
            </label>
            {campo("inyeccionPct", "Inyección (% del peso)")}
          </div>
        </>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {campo("mermaMinPct", "Merma mín. (%)", "Rango mientras no haya lotes medidos")}
        {campo("mermaMaxPct", "Merma máx. (%)")}
        {campo("mermaGrasaPct", "Grasa en la merma (%)", "Goteo en cortes grasos (tocino, costillar)")}
        {campo("huesoPct", "Hueso (% del peso como se vende)")}
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="tablaConHueso" checked={c.tablaConHueso} onChange={(e) => set({ tablaConHueso: e.target.checked })} />
          Declarar la tabla por 100 g tal como se vende (con hueso). Si no, por parte comestible.
        </label>
      </div>

      <input type="hidden" name="supuestos" value={JSON.stringify(c.supuestos)} />
      <div className="mt-4">
        <h3 className="text-sm font-bold text-dark">Hoja de supuestos</h3>
        <p className="text-xs text-muted">Marca cada dato cuando esté confirmado (medido o verificado). Lo no confirmado es supuesto.</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {PARAMETROS_SUPUESTOS.map(({ clave, etiqueta }) => {
            const conf = c.supuestos[clave] === "confirmado";
            return (
              <li key={clave}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={conf}
                    onChange={(e) => set({ supuestos: { ...c.supuestos, [clave]: e.target.checked ? "confirmado" : "supuesto" } })}
                  />
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${conf ? "bg-dark text-background" : "bg-gold/30 text-dark"}`}>
                    {conf ? "CONFIRMADO" : "SUPUESTO"}
                  </span>
                  {etiqueta}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </fieldset>
  );
}
