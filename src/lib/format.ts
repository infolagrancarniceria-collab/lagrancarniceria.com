export function formatoCLP(valor: number): string {
  return valor.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

// Gramos bajo 1 kg, kilos con coma decimal desde 1 kg (ej. "1,2 kg") — regla
// explícita del prompt de diseño (sección 14, notas técnicas).
export function formatoPeso(gramos: number): string {
  if (gramos < 1000) return `${gramos} g`;
  const kilos = gramos / 1000;
  const texto = kilos.toFixed(1).replace(".", ",").replace(",0", "");
  return `${texto} kg`;
}

export function redondear50(gramos: number): number {
  return Math.round(gramos / 50) * 50;
}

// "2026-10-20" (valor de un <input type="date">) -> "martes 20 de octubre" —
// se arma la fecha con año/mes/día sueltos (no "new Date(fechaISO)" directo)
// para que no se corra un día por la zona horaria del navegador, que
// interpretaría la fecha-sola como medianoche UTC.
export function formatoFechaLegible(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
}
