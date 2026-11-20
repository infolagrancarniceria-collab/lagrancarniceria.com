import { redirect } from "next/navigation";
import { moduloConfigurado, sesionValida } from "@/lib/etiquetado/auth";
import FormIngresar from "./FormIngresar";

export default async function IngresarPage() {
  if (await sesionValida()) redirect("/etiquetado");
  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-card-border bg-card p-6">
      <h1 className="text-xl font-bold text-dark">Etiquetado nutricional</h1>
      <p className="mt-1 text-sm text-muted">Acceso interno de La Gran Carnicería.</p>
      {moduloConfigurado() ? (
        <FormIngresar />
      ) : (
        <p className="mt-4 rounded-lg bg-surface p-3 text-sm">
          Falta configurar la variable de entorno <code>ETIQUETADO_CLAVE</code> (mínimo 8 caracteres) en el servidor.
        </p>
      )}
    </div>
  );
}
