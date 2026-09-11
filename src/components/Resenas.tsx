// Reseñas reales de clientes — no se inventan testimonios ni nombres (el
// prompt de diseño pide no inventar datos que no estén en él, y esa regla
// aplica más todavía a citas atribuidas a personas reales). Se cargan acá
// como { nombre, texto, estrellas } a medida que van llegando por el
// formulario de reseñas, ya filtradas por las que autorizaron publicarse.
const RESENAS: { nombre: string; texto: string; estrellas: number }[] = [
  { nombre: "Sandra R.", estrellas: 5, texto: "Todo bien, la atención, calidad y puntualidad." },
  {
    nombre: "María Eugenia G.",
    estrellas: 5,
    texto:
      "Todo lo que pedí venía exactamente como lo encargué. Bien separado al vacío, bien porcionado, y al cocinarlo, de verdad muy sabroso. Nada de agua y sabor a carne y pollo de cuando uno era chica y compraba en carnicería, diferente a la del supermercado de todas maneras.",
  },
  {
    nombre: "Paola A.",
    estrellas: 5,
    texto:
      "Me encanta comprar acá. El despacho a domicilio es demasiado cómodo y me ayuda muchísimo a organizar las compras de la semana. Además, siempre tienen muy buena disposición para asesorarte y recomendarte qué corte de carne queda mejor según la preparación que quieras hacer. Se agradece muchísimo esa atención y preocupación, porque hace que comprar sea mucho más fácil. ¡Totalmente recomendados! 🥩❤️",
  },
  { nombre: "Francisca A.", estrellas: 5, texto: "Todo me pareció perfecto, muy buena calidad, empaque y la entrega 10/10." },
  {
    nombre: "Romina",
    estrellas: 5,
    texto: "La verdad me parece genial que venga al vacío y que la separen como uno quiere que quede porcionada.",
  },
];

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <div aria-label={`${cantidad} de 5 estrellas`} className="text-sm leading-none" style={{ color: "var(--gold)" }}>
      {"★".repeat(cantidad)}
      <span style={{ color: "var(--card-border)" }}>{"★".repeat(5 - cantidad)}</span>
    </div>
  );
}

export default function Resenas() {
  return (
    <section id="resenas" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Reseñas</h2>

      {RESENAS.length === 0 ? (
        <p className="mt-6 rounded-xl bg-card p-6 text-muted" style={{ border: "1px solid var(--card-border)" }}>
          Todavía no publicamos reseñas de clientes acá — muy pronto.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESENAS.map((r, i) => (
            <blockquote key={`${r.nombre}-${i}`} className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
              <Estrellas cantidad={r.estrellas} />
              <p className="mt-2 text-text">&ldquo;{r.texto}&rdquo;</p>
              <footer className="mt-3 text-sm font-semibold text-accent">{r.nombre}</footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  );
}
