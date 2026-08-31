export default function BotonWhatsappFlotante() {
  return (
    <a
      href="https://wa.me/56991508931"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
      style={{ background: "var(--accent)", color: "var(--background)", boxShadow: "0 2px 10px rgba(0,0,0,.2)" }}
      aria-label="Escríbenos por WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.92C21.96 6.45 17.51 2 12.04 2Zm5.83 14.02c-.25.7-1.24 1.28-2.03 1.45-.54.11-1.24.2-3.62-.78-3.04-1.26-5-4.35-5.15-4.55-.15-.2-1.23-1.64-1.23-3.13s.77-2.22 1.05-2.52c.25-.27.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4-.06.62.48.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.27 1.64 2.06 1.13 1.02 2.08 1.34 2.37 1.49.29.15.46.13.63-.05.17-.18.72-.85.92-1.14.2-.29.4-.24.66-.15.27.1 1.72.82 2.02.97.29.15.49.22.56.35.07.13.07.75-.18 1.45Z" />
      </svg>
    </a>
  );
}
