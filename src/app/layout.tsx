import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "La Gran Carnicería — Carnicería familiar en Cerro Navia con despacho",
  description:
    "Carnicería familiar desde 1990 en Cerro Navia. Cortes de vacuno, cerdo, pollo y más — con despacho a domicilio en Santiago.",
};

const WHATSAPP = "https://wa.me/56991508931";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-surface-border">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
            <Link href="/" className="font-display text-xl font-bold tracking-wide text-accent-strong">
              La Gran Carnicería
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/precios" className="hover:text-accent">
                Precios
              </Link>
              <Link href="/precios#despacho" className="hover:text-accent">
                Despacho
              </Link>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-4 py-2 font-medium text-background hover:bg-accent-strong"
              >
                WhatsApp
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-surface-border">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>La Gran Carnicería — desde 1990 — Juan Bautista Inostroza 7809, Cerro Navia</p>
            <div className="flex gap-4">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                WhatsApp
              </a>
              <a
                href="https://instagram.com/lagran.carniceria"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                @lagran.carniceria
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
