export default function Footer() {
  return (
    <footer style={{ background: "var(--dark)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-background/80 sm:flex-row sm:items-center sm:justify-between">
        <p>La Gran Carnicería — desde 1990 — Juan Bautista Inostroza 7809, Cerro Navia</p>
        <div className="flex gap-4">
          <a href="https://wa.me/56991508931" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
            WhatsApp
          </a>
          <a
            href="https://instagram.com/lagran.carniceria"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            @lagran.carniceria
          </a>
        </div>
      </div>
    </footer>
  );
}
