"use client";

export default function BotonImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-lg bg-dark px-4 py-2 text-sm font-bold text-background">
      Imprimir / guardar PDF
    </button>
  );
}
