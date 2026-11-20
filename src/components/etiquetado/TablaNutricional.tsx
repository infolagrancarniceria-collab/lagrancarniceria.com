import { formatoEntero, formatoG, type NutrientesPor100 } from "@/lib/etiquetado/calculo";

// Tabla de información nutricional con el orden del manual (Imagen N°4/6,
// págs. 20-21): 2 columnas, por 100 g y por porción. Sin hooks: se usa
// igual en la etiqueta impresa, el editor y la ficha pública.
export default function TablaNutricional({
  porcionG,
  porcionMedidaCasera,
  porcionesEnvase,
  por100,
  porPorcion,
  desglosarGrasas,
  escala = 1,
}: {
  porcionG: number;
  porcionMedidaCasera: string;
  // null = no se muestra (ej. en la web, donde el envase varía).
  porcionesEnvase: number | null;
  por100: NutrientesPor100;
  porPorcion: NutrientesPor100;
  desglosarGrasas: boolean;
  escala?: number;
}) {
  type Fila = { etiqueta: string; clave: keyof NutrientesPor100; entero?: boolean; sub?: boolean };
  const filas: Fila[] = [
    { etiqueta: "Energía (kcal)", clave: "energiaKcal", entero: true },
    { etiqueta: "Proteínas (g)", clave: "proteinasG" },
    { etiqueta: "Grasa total (g)", clave: "grasaTotalG" },
    ...(desglosarGrasas
      ? ([
          { etiqueta: "Grasa saturada (g)", clave: "grasaSatG", sub: true },
          { etiqueta: "Grasa monoinsat. (g)", clave: "grasaMonoG", sub: true },
          { etiqueta: "Grasa poliinsat. (g)", clave: "grasaPoliG", sub: true },
          { etiqueta: "Grasa trans (g)", clave: "grasaTransG", sub: true },
          { etiqueta: "Colesterol (mg)", clave: "colesterolMg", entero: true },
        ] as Fila[])
      : []),
    { etiqueta: "H. de C. disp. (g)", clave: "hcDispG" },
    { etiqueta: "Azúcares totales (g)", clave: "azucaresG", sub: true },
    { etiqueta: "Sodio (mg)", clave: "sodioMg", entero: true },
  ];
  const fmt = (f: Fila, v: number) => (f.entero ? formatoEntero(v) : formatoG(v));
  const fs = (pt: number) => `${pt * escala}pt`;

  return (
    <div
      style={{
        border: "1.5px solid #000",
        color: "#000",
        background: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: fs(7),
        lineHeight: 1.25,
        padding: "0.12em 0.4em 0.3em",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: fs(9), textAlign: "center", borderBottom: "1px solid #000", padding: "0.1em 0" }}>
        INFORMACIÓN NUTRICIONAL
      </div>
      <div style={{ borderBottom: "1px solid #000", padding: "0.15em 0" }}>
        <div>
          <b>Porción:</b> {porcionMedidaCasera} ({formatoEntero(porcionG)} g)
        </div>
        {porcionesEnvase != null && (
          <div>
            <b>Porciones por envase:</b> aprox. {porcionesEnvase}
          </div>
        )}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th />
            <th style={{ textAlign: "right", fontWeight: 700, padding: "0.1em 0 0.1em 0.5em" }}>100 g</th>
            <th style={{ textAlign: "right", fontWeight: 700, padding: "0.1em 0 0.1em 0.5em" }}>1 porción</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.clave}>
              <td style={{ paddingLeft: f.sub ? "0.7em" : 0, fontWeight: f.sub ? 400 : 700 }}>{f.etiqueta}</td>
              <td style={{ textAlign: "right" }}>{fmt(f, por100[f.clave])}</td>
              <td style={{ textAlign: "right" }}>{fmt(f, porPorcion[f.clave])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
