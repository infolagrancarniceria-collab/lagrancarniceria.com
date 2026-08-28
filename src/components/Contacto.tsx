const WHATSAPP = "https://wa.me/56991508931";

export default function Contacto() {
  return (
    <section id="contacto" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16">
      <h2 className="font-display text-3xl text-dark sm:text-4xl">Contacto</h2>
      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-accent">Dirección</dt>
          <dd className="mt-1 text-text">Juan Bautista Inostroza 7809, Cerro Navia, Santiago</dd>
        </div>
        <div className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-accent">Horario</dt>
          <dd className="mt-1 text-text">Lunes a Domingo, 9:00–15:00</dd>
        </div>
        <div className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-accent">WhatsApp</dt>
          <dd className="mt-1">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">
              +56 9 9150 8931
            </a>
          </dd>
        </div>
        <div className="rounded-xl bg-card p-5" style={{ border: "1px solid var(--card-border)" }}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-accent">Instagram</dt>
          <dd className="mt-1">
            <a
              href="https://instagram.com/lagran.carniceria"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              @lagran.carniceria
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
