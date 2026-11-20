import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/etiquetado/auth";
import FormEmpresa from "./FormEmpresa";

export default async function EmpresaPage() {
  await requerirSesion();
  const datos = await prisma.datosRotulo.findUnique({ where: { id: 1 } });
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark">Datos del rótulo</h1>
      <p className="text-sm text-muted">Rotulación general (pág. 16 del manual): se imprimen en todas las etiquetas.</p>
      <FormEmpresa datos={datos} />
    </div>
  );
}
