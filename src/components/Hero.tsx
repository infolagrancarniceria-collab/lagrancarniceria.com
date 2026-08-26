export default function Hero() {
  return (
    <section className="px-4 py-20 sm:py-28" style={{ background: "var(--dark)" }}>
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Desde 1990</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-background sm:text-6xl">
          Tradición y calidad en cada corte
        </h1>
        <p
          className="mt-6 max-w-xl pl-4 text-lg text-background/80"
          style={{ borderLeft: "3px solid var(--accent)" }}
        >
          Carnicería familiar de barrio en Cerro Navia, con más de 30 años atendiendo a nuestros vecinos — y despacho
          a domicilio en gran parte de Santiago.
        </p>
        <div className="mt-10">
          <a
            href="#catalogo"
            className="inline-block rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300"
            style={{ background: "var(--accent)", color: "var(--background)" }}
          >
            Ver catálogo
          </a>
        </div>
      </div>
    </section>
  );
}
