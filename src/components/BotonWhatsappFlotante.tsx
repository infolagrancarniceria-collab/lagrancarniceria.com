export default function BotonWhatsappFlotante() {
  return (
    <a
      href="https://wa.me/56991508931"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-105"
      style={{ background: "var(--accent)", color: "var(--background)", boxShadow: "0 2px 10px rgba(0,0,0,.2)" }}
      aria-label="Escríbenos por WhatsApp"
    >
      WSP
    </a>
  );
}
