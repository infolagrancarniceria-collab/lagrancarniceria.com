import type { Metadata } from "next";
import Link from "next/link";
import { sesionValida } from "@/lib/etiquetado/auth";
import { salir } from "./acciones";
import "../../globals.css";

// Segundo root layout (route group "(admin)"): el módulo de etiquetado no
// lleva el header/footer/carrito del sitio público, y no se indexa.
export const metadata: Metadata = {
  title: "Etiquetado nutricional — La Gran Carnicería",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EtiquetadoLayout({ children }: LayoutProps<"/etiquetado">) {
  const conSesion = await sesionValida();
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-[Arial,Helvetica,sans-serif] text-text">
        {conSesion && (
          <header className="no-print border-b border-card-border bg-dark text-background">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
              <Link href="/etiquetado" className="font-bold text-gold">
                Etiquetado nutricional
              </Link>
              <Link href="/etiquetado">Productos</Link>
              <Link href="/etiquetado/ingredientes">Ingredientes</Link>
              <Link href="/etiquetado/empresa">Datos del rótulo</Link>
              <form action={salir} className="ml-auto">
                <button className="text-background/70 underline">Salir</button>
              </form>
            </nav>
          </header>
        )}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
