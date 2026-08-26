import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
      <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">Desde 1990</p>
      <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-6xl">
        Carnicería familiar
        <br />
        en Cerro Navia
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Cortes de vacuno, cerdo, pollo y más, con la atención de siempre — y despacho a domicilio en gran parte de
        Santiago.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/precios"
          className="rounded-full bg-accent px-6 py-3 font-medium text-background hover:bg-accent-strong"
        >
          Ver precios
        </Link>
        <Link
          href="/precios#despacho"
          className="rounded-full border border-surface-border px-6 py-3 font-medium hover:border-accent hover:text-accent"
        >
          Valores de despacho
        </Link>
      </div>
    </div>
  );
}
