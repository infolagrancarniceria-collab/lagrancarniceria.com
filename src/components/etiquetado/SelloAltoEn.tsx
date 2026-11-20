import type { Sello } from "@/lib/etiquetado/calculo";

// Sello "ALTO EN" (Anexo 3 del manual MINSAL): octógono negro con borde
// blanco y contorno negro fino, texto blanco. Se dibuja en SVG para que se
// imprima nítido al tamaño exacto en cm que corresponde a la etiqueta.
const LINEAS: Record<Sello, string[]> = {
  azucares: ["AZÚCARES"],
  grasasSaturadas: ["GRASAS", "SATURADAS"],
  sodio: ["SODIO"],
  calorias: ["CALORÍAS"],
};

function octogono(r: number, c = 50): string {
  const pts: string[] = [];
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + 45 * k) * Math.PI) / 180;
    pts.push(`${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export default function SelloAltoEn({ sello, tamano }: { sello: Sello; tamano: string }) {
  const lineas = LINEAS[sello];
  const dos = lineas.length === 2;
  return (
    <svg
      viewBox="0 0 100 100"
      width={tamano}
      height={tamano}
      role="img"
      aria-label={`ALTO EN ${lineas.join(" ")} — Ministerio de Salud`}
      style={{ display: "block", flex: "none" }}
    >
      <polygon points={octogono(53.5)} fill="#000" />
      <polygon points={octogono(50.5)} fill="#fff" />
      <polygon points={octogono(46.5)} fill="#000" />
      <g fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" textAnchor="middle">
        <text x="50" y={dos ? 31 : 38} fontSize="14">
          ALTO EN
        </text>
        {dos ? (
          <>
            <text x="50" y="49" fontSize="13">
              {lineas[0]}
            </text>
            <text x="50" y="63" fontSize="11.5">
              {lineas[1]}
            </text>
          </>
        ) : (
          <text x="50" y="57" fontSize={lineas[0].length > 7 ? 14.5 : 17}>
            {lineas[0]}
          </text>
        )}
        <text x="50" y="76" fontSize="6.2" fontWeight="400">
          Ministerio
        </text>
        <text x="50" y="83" fontSize="6.2" fontWeight="400">
          de Salud
        </text>
      </g>
    </svg>
  );
}
