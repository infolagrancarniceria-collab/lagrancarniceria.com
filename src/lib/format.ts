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
