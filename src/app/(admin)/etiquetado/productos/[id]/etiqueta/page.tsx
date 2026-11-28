import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import { alergenosDe, formatoEntero, porcionesPorEnvase, tamanoSelloCm, textoIngredientes, TEXTO_SELLO } from "@/lib/etiquetado/calculo";
import { calcularProducto, fechaVencimientoLote, formatoFecha, mapaIngredientes, mermaDeLote, rangoProducto } from "@/lib/etiquetado/datos";
import TablaNutricional from "@/components/etiquetado/TablaNutricional";
import SelloAltoEn from "@/components/etiquetado/SelloAltoEn";
import BotonImprimir from "./BotonImprimir";
import { CAMPOS_DISENO, leerPosiciones, type CampoDiseno } from "@/lib/etiquetado/diseno";

function numero(v: string | string[] | undefined): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const t = v.trim();
  const x = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(x) && x > 0 ? x : null;
}

const input = "rounded-lg border border-card-border bg-white px-3 py-2";

// Margen de la hoja al imprimir y separación entre piezas (guía de corte).
const MARGEN_HOJA_CM = 0.5;
const SEP_PIEZAS_CM = 0.2;

export default async function EtiquetaPage({ params, searchParams }: PageProps<"/etiquetado/productos/[id]/etiqueta">) {
  await requerirSesion();
  const { id } = await params;
  const sp = await searchParams;

  const [producto, ingredientes, rotulo] = await Promise.all([
    prisma.productoArtesanal.findUnique({
      where: { id: Number(id) || 0 },
      include: { items: true, lotes: { orderBy: { fechaElaboracion: "desc" } } },
    }),
    mapaIngredientes(),
    prisma.datosRotulo.findUnique({ where: { id: 1 } }),
  ]);
  if (!producto) notFound();

  const loteId = Number(sp.lote) || null;
  const lote = loteId ? producto.lotes.find((l) => l.id === loteId) ?? null : null;
  const merma = lote ? mermaDeLote(lote) : producto.mermaPct;
  const r = calcularProducto(producto, ingredientes, merma);
  const rango = rangoProducto(producto, ingredientes, lote ? merma : null);

  const ancho = numero(sp.ancho) ?? producto.etiquetaAnchoCm;
  const alto = numero(sp.alto) ?? producto.etiquetaAltoCm;
  const netoG = numero(sp.neto);
  const piezas = sp.piezas === "frente" || sp.piezas === "info" ? sp.piezas : "ambas";
  const hoja = sp.hoja === "carta" ? "carta" : "a4";
  const area = ancho && alto ? ancho * alto : null;
  const selloCm = area ? tamanoSelloCm(area) : null;
  const sellos = r.sellosQueCorresponden;

  const hoy = new Date().toISOString().slice(0, 10);
  const elabTexto = typeof sp.elab === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.elab) ? sp.elab : hoy;
  const fechaElab = lote ? lote.fechaElaboracion : new Date(`${elabTexto}T00:00:00Z`);
  const fechaVenc = lote
    ? fechaVencimientoLote(lote, producto.vidaUtilDias)
    : fechaVencimientoLote({ fechaElaboracion: fechaElab, fechaVencimiento: null }, producto.vidaUtilDias);
  const codigoLote = lote?.codigo ?? (typeof sp.codigo === "string" && sp.codigo.trim() ? sp.codigo.trim() : null);

  // Anexo 3: sellos en el cuadrante superior derecho de la cara principal.
  // Presentación 1 = hasta 2 por fila; Presentación 2 (todos en una fila)
  // solo si la altura del cuadrante no alcanza para la 1.
  const sep = 0.15;
  // Disposición vertical (opcional, por producto): una columna, uno bajo
  // otro, alineada al borde derecho.
  const vertical = sp.sellos === "vertical" || (sp.sellos !== "fila" && producto.sellosVertical);
  let columnas = vertical ? 1 : Math.min(2, sellos.length);
  let filasSellos = vertical ? sellos.length : Math.ceil(sellos.length / 2);
  let cabenSellos = true;
  if (selloCm && ancho && alto && sellos.length > 0) {
    const cabe = (c: number, f: number) => c * selloCm + (c - 1) * sep <= ancho / 2 + 0.01 && f * selloCm + (f - 1) * sep <= alto / 2 + 0.01;
    if (!cabe(columnas, filasSellos)) {
      if (!vertical && cabe(sellos.length, 1)) {
        columnas = sellos.length;
        filasSellos = 1;
      } else cabenSellos = false;
    }
  }

  const avisos: string[] = [];
  if (!ancho || !alto) avisos.push("Ingresa el ancho y alto de la cara principal para calcular el tamaño de los sellos.");
  if (area != null && area < 30)
    avisos.push("La cara principal mide menos de 30 cm²: los sellos van en el envase mayor que contenga los productos (pág. 30).");
  if (sellos.length > 0 && selloCm && !cabenSellos)
    avisos.push(
      vertical
        ? `Los ${sellos.length} sellos de ${selloCm} cm en columna no caben en la mitad superior de la etiqueta: usa la disposición en fila o una etiqueta más alta.`
        : `Los sellos de ${selloCm} cm no caben en el cuadrante superior derecho: usa una etiqueta más grande.`
    );
  if (vertical && sellos.length > 1)
    avisos.push("Sellos en columna: el Anexo 3 del manual solo muestra disposiciones en fila; confirma con la Seremi si la vas a usar.");
  if (!rotulo) avisos.push("Faltan los datos del rótulo (razón social, domicilio, resolución).");
  if (!fechaVenc) avisos.push("El producto no tiene vida útil: la fecha de vencimiento queda en blanco.");
  if (!codigoLote) avisos.push("Sin lote: elige un lote registrado o escribe un código.");
  if (!netoG) avisos.push("Sin peso neto: el contenido neto y las porciones por envase quedan en blanco para completarlos a mano.");
  if (merma === 0 && !lote) avisos.push("Merma 0 %: correcto solo si el producto se vende crudo, sin cocción/ahumado/secado.");
  if (producto.disenoFrontalUrl && !leerPosiciones(producto.disenoCampos).neto)
    avisos.push("El diseño no tiene ubicado el peso neto: en el frente queda la línea en blanco (igual va en la cara de información).");
  avisos.push(...r.advertencias);

  const porciones = netoG ? porcionesPorEnvase(netoG, producto.porcionG) : null;
  const diseno = producto.disenoFrontalUrl;
  const posiciones = leerPosiciones(producto.disenoCampos);
  const valoresCampos: Partial<Record<CampoDiseno, string>> = {
    neto: netoG ? formatoEntero(netoG) : "",
    elab: formatoFecha(fechaElab),
    venc: fechaVenc ? formatoFecha(fechaVenc) : "",
    lote: codigoLote ?? "",
  };
  const alergenos = alergenosDe(r.lineas);
  const cm = (v: number) => `${v}cm`;
  const anchoPieza = ancho ?? 10;
  // La cara de información puede tener otro ancho que el frente (ej. frente
  // de 12 × 8 cm e información de 9 cm de ancho, que caben 4 por hoja).
  const anchoInfo = numero(sp.anchoInfo) ?? anchoPieza;
  const altoPieza = alto ?? 10;
  // Alto reservado para la cara de información (crece si el texto no cabe).
  const altoInfo = numero(sp.altoInfo) ?? 10;

  // Cuántas piezas caben por hoja: márgenes de 5 mm (las impresoras de tinta
  // imprimen hasta ~3 mm del borde) y 0,2 cm entre piezas para cortar.
  const [hojaAncho, hojaAlto] = hoja === "carta" ? [21.59, 27.94] : [21, 29.7];
  const caben = (w: number, h: number) =>
    Math.max(0, Math.floor((hojaAncho - 2 * MARGEN_HOJA_CM + SEP_PIEZAS_CM) / (w + SEP_PIEZAS_CM))) *
    Math.max(0, Math.floor((hojaAlto - 2 * MARGEN_HOJA_CM + SEP_PIEZAS_CM) / (h + SEP_PIEZAS_CM)));
  const frentesPorHoja = caben(anchoPieza, altoPieza);
  const infosPorHoja = caben(anchoInfo, altoInfo);
  // Pares frente + información que llenan una hoja (aprox.: se imprimen
  // primero todos los frentes y luego todas las de información).
  const paresPorHoja =
    frentesPorHoja > 0 && infosPorHoja > 0 ? Math.max(1, Math.floor((frentesPorHoja * infosPorHoja) / (frentesPorHoja + infosPorHoja))) : 1;
  const porHoja = piezas === "frente" ? frentesPorHoja : piezas === "info" ? infosPorHoja : paresPorHoja;
  // "Hojas a llenar" manda sobre "Copias": copias = lo que cabe × hojas.
  const hojas = numero(sp.hojas) ? Math.min(Math.round(numero(sp.hojas)!), 20) : null;
  const copias = Math.min(Math.max(hojas ? Math.max(porHoja, 1) * hojas : Math.round(numero(sp.copias) ?? 1), 1), 300);
  const hojasNecesarias = Math.ceil(copias / Math.max(porHoja, 1));

  // Cara principal y cara de información; se repiten "copias" veces para
  // aprovechar la hoja de vinilo (ej. 3 frentes de 12 × 8 cm por A4).
  const renderFrente = (k: number) => (
    <div
      key={`f${k}`}
      className="pieza-etiqueta"
      style={{
        width: cm(anchoPieza),
        height: cm(altoPieza),
        position: "relative",
        background: "#fff",
        color: "#000",
        outline: "1px dashed #999",
        fontFamily: "Arial, Helvetica, sans-serif",
        overflow: "hidden",
      }}
    >
      {diseno ? (
        // Diseño propio (Canva) de fondo, a tamaño exacto de la pieza.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={diseno} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill" }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.webp" alt="" style={{ position: "absolute", left: "0.3cm", top: "0.3cm", width: `${Math.min(anchoPieza * 0.3, 3)}cm` }} />
      )}
      {sellos.length > 0 && selloCm && (
        <div
          style={{
            position: "absolute",
            right: "0.2cm",
            top: "0.2cm",
            display: "grid",
            gridTemplateColumns: `repeat(${columnas}, ${cm(selloCm)})`,
            gap: cm(sep),
            justifyItems: "center",
          }}
        >
          {sellos.map((s) => (
            <SelloAltoEn key={s} sello={s} tamano={cm(selloCm)} />
          ))}
        </div>
      )}
      {diseno ? (
        CAMPOS_DISENO.map(({ clave }) => {
          const p = posiciones[clave];
          if (!p) return null;
          return (
            <span
              key={clave}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: "translateY(-100%)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: `${Math.max(7, Math.min(11, altoPieza * 1.05))}pt`,
                fontWeight: 700,
                color: "#2b2420",
                whiteSpace: "nowrap",
                lineHeight: 1,
                paddingBottom: "0.04cm",
              }}
            >
              {valoresCampos[clave] ?? ""}
            </span>
          );
        })
      ) : (
        <div
          style={{
            position: "absolute",
            left: "0.3cm",
            right: "0.3cm",
            bottom: "0.3cm",
            top: `${Math.max(altoPieza / 2, (selloCm ?? 0) * filasSellos + 0.4)}cm`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: `${Math.min(18, Math.max(10, anchoPieza * 1.6))}pt`, lineHeight: 1.1 }}>
            {producto.nombre}
          </div>
          <div style={{ fontSize: "9pt", marginTop: "0.15cm" }}>
            Contenido neto: {netoG ? `${formatoEntero(netoG)} g` : "________ g"}
          </div>
        </div>
      )}
    </div>

  );

  const renderInfo = (k: number) => (
    <div
      key={`i${k}`}
      className="pieza-etiqueta"
      style={{
        width: cm(anchoInfo),
        minHeight: cm(altoInfo),
        background: "#fff",
        color: "#000",
        outline: "1px dashed #999",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "6.5pt",
        lineHeight: 1.3,
        padding: "0.25cm",
        display: "flex",
        flexDirection: "column",
        gap: "0.12cm",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "8pt" }}>{producto.nombre}</div>
      <div>
        <b>Ingredientes:</b> {textoIngredientes(r.lineas)}
        {alergenos.length > 0 && (
          <>
            {" "}
            <b>Contiene: {alergenos.join(", ")}.</b>
          </>
        )}
      </div>
      {producto.leyendaAdicional && <div style={{ fontWeight: 700 }}>{producto.leyendaAdicional}</div>}
      <TablaNutricional
        porcionG={producto.porcionG}
        porcionMedidaCasera={producto.porcionMedidaCasera}
        porcionesEnvase={porciones}
        por100={r.por100}
        porPorcion={r.porPorcion}
        desglosarGrasas={r.desglosarGrasas}
      />
      {!porciones && <div>Porciones por envase: aprox. ____</div>}
      <div>
        <b>Elab.:</b> {formatoFecha(fechaElab)} &nbsp; <b>Venc.:</b> {fechaVenc ? formatoFecha(fechaVenc) : "__/__/__"} &nbsp;{" "}
        <b>Lote:</b> {codigoLote ?? "________"}
      </div>
      {producto.almacenamiento && (
        <div>
          <b>Conservación:</b> {producto.almacenamiento}
        </div>
      )}
      {producto.instruccionesUso && (
        <div>
          <b>Modo de uso:</b> {producto.instruccionesUso}
        </div>
      )}
      <div>
        <b>Contenido neto:</b> {netoG ? `${formatoEntero(netoG)} g` : "________ g"}
      </div>
      {rotulo && (
        <div>
          <b>Elaborado por:</b> {rotulo.razonSocial}, {rotulo.domicilio}. {rotulo.resolucionSanitaria} País de origen:{" "}
          {rotulo.paisOrigen}.{rotulo.contacto ? ` ${rotulo.contacto}` : ""}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="no-print">
        <Link href={`/etiquetado/productos/${producto.id}`} className="text-sm text-accent">
          ← {producto.nombre}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-dark">Etiqueta — {producto.nombre}</h1>

        <form method="get" className="mt-4 grid gap-3 rounded-xl border border-card-border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Lote
            <select name="lote" defaultValue={lote?.id ?? ""} className={input}>
              <option value="">Sin lote registrado (merma típica {producto.mermaPct} %)</option>
              {producto.lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo} · {formatoFecha(l.fechaElaboracion)} · merma {mermaDeLote(l).toLocaleString("es-CL", { maximumFractionDigits: 1 })} %
                </option>
              ))}
            </select>
          </label>
          {!lote && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                Código de lote
                <input name="codigo" defaultValue={codigoLote ?? ""} className={input} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Elaboración
                <input name="elab" type="date" defaultValue={elabTexto} className={input} />
              </label>
            </>
          )}
          <label className="flex flex-col gap-1 text-sm">
            Peso neto del envase (g)
            <input name="neto" defaultValue={netoG ?? ""} inputMode="decimal" className={input} placeholder="ej. 520" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Ancho cara principal (cm)
            <input name="ancho" defaultValue={ancho ?? ""} inputMode="decimal" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Alto cara principal (cm)
            <input name="alto" defaultValue={alto ?? ""} inputMode="decimal" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Ancho información (cm)
            <input name="anchoInfo" defaultValue={numero(sp.anchoInfo) ?? ""} inputMode="decimal" className={input} placeholder="igual al frente" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Alto información (cm)
            <input name="altoInfo" defaultValue={numero(sp.altoInfo) ?? ""} inputMode="decimal" className={input} placeholder="10" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sellos
            <select name="sellos" defaultValue={vertical ? "vertical" : "fila"} className={input}>
              <option value="fila">En fila (Anexo 3)</option>
              <option value="vertical">En columna</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Hoja
            <select name="hoja" defaultValue={hoja} className={input}>
              <option value="a4">A4</option>
              <option value="carta">Carta</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Imprimir
            <select name="piezas" defaultValue={piezas} className={input}>
              <option value="ambas">Frente + información</option>
              <option value="frente">Solo frentes</option>
              <option value="info">Solo información</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Hojas a llenar
            <input name="hojas" defaultValue={hojas ?? ""} inputMode="numeric" className={input} placeholder="ej. 2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            o copias exactas
            <input name="copias" defaultValue={hojas ? "" : copias} inputMode="numeric" className={input} disabled={!!hojas} />
          </label>
          <div className="flex items-end gap-3 sm:col-span-3 lg:col-span-6">
            <button className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background">Actualizar</button>
            {r.bloqueante ? (
              <span className="rounded-lg bg-offer px-4 py-2 text-sm font-bold text-background">Corrige los datos antes de imprimir</span>
            ) : (
              <BotonImprimir />
            )}
            <span className="text-xs text-muted">
              <b className="text-dark">
                Por hoja {hoja === "carta" ? "carta" : "A4"}: {frentesPorHoja} frentes ({anchoPieza} × {altoPieza} cm) · {infosPorHoja}{" "}
                de información ({anchoInfo} × {altoInfo} cm). Se imprimen {copias}{" "}
                {piezas === "frente" ? "frentes" : piezas === "info" ? "de información" : "pares"} en ~{hojasNecesarias} hoja
                {hojasNecesarias === 1 ? "" : "s"}.
              </b>
              <br />
              Área {area ? `${formatoEntero(area)} cm²` : "—"} · sello {selloCm ? `${selloCm} × ${selloCm} cm` : "—"} · merma{" "}
              {merma.toLocaleString("es-CL", { maximumFractionDigits: 1 })} %
            </span>
          </div>
        </form>

        {r.bloqueante && (
          <div className="mt-3 rounded-xl border-2 border-offer bg-card p-4 text-sm">
            <p className="font-bold text-offer">Los valores de esta etiqueta son imposibles y no se puede imprimir.</p>
            <p className="mt-1">
              Merma usada: {merma.toLocaleString("es-CL", { maximumFractionDigits: 1 })} %
              {lote
                ? ` (lote ${lote.codigo}: ${(lote.pesoAntesG / 1000).toLocaleString("es-CL")} kg → ${(lote.pesoFinalG / 1000).toLocaleString("es-CL")} kg)`
                : " (merma típica del producto)"}
              . Elimina ese lote y regístralo con los pesos correctos, o corrige la merma típica del producto.
            </p>
          </div>
        )}
        {rango && rango.zonaGris.length > 0 && (
          <div className="mt-3 rounded-xl border-2 border-gold bg-card p-4 text-sm">
            <p className="font-bold text-dark">
              ZONA GRIS: {rango.zonaGris.map((z) => TEXTO_SELLO[z]).join(", ")}
            </p>
            <p className="mt-1">
              Con los supuestos actuales el sello puede corresponder o no (sodio {formatoEntero(rango.min.sodioMg)}–
              {formatoEntero(rango.max.sodioMg)} mg · energía {formatoEntero(rango.min.energiaKcal)}–{formatoEntero(rango.max.energiaKcal)}{" "}
              kcal por 100 g). La etiqueta usa el valor central; confirma con un lote medido o análisis de laboratorio.
            </p>
          </div>
        )}
        {avisos.length > 0 && (
          <ul className="mt-3 list-disc rounded-xl border border-gold bg-card py-3 pl-8 pr-4 text-sm">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">
          Se imprime a tamaño real (100 %, sin &quot;ajustar a la página&quot;). Las líneas punteadas son guías de corte.
        </p>
      </div>

      {/* Tamaño de hoja y márgenes de impresión según lo elegido. */}
      <style>{`@page { size: ${hoja === "carta" ? "letter" : "A4"} portrait; margin: ${MARGEN_HOJA_CM * 10}mm; }`}</style>
      {/* Primero todos los frentes y después todas las de información:
          así las piezas del mismo tamaño quedan juntas y llenan mejor la hoja. */}
      <div className="hoja-etiquetas mt-6 flex flex-wrap items-start" style={{ gap: `${SEP_PIEZAS_CM}cm` }}>
        {piezas !== "info" && Array.from({ length: copias }, (_, i) => renderFrente(i))}
        {piezas !== "frente" && Array.from({ length: copias }, (_, i) => renderInfo(i))}
      </div>
    </div>
  );
}
