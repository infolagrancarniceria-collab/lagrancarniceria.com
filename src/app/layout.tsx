import type { Metadata } from "next";
import { Abril_Fatface, Asar } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { aProductoPublico, type ComunaPublica, type CorteOpcionPublica, type ProductoPublico } from "@/lib/types";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BotonWhatsappFlotante from "@/components/BotonWhatsappFlotante";
import PopupOferta from "@/components/PopupOferta";
import CotizadorModal from "@/components/CotizadorModal";
import CarritoDrawer from "@/components/CarritoDrawer";
import ConfirmarDrawer from "@/components/ConfirmarDrawer";
import "./globals.css";

const abrilFatface = Abril_Fatface({
  variable: "--font-abril-fatface",
  subsets: ["latin"],
  weight: "400",
});

const asar = Asar({
  variable: "--font-asar",
  subsets: ["latin"],
  weight: "400",
});

// Sin esto, Next intentaría prerenderizar el layout en build (sin base de
// datos disponible todavía en ese momento) — mismo motivo que tenía
// /precios antes de este rediseño.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La Gran Carnicería — Carnicería familiar en Cerro Navia con despacho",
  description:
    "Carnicería familiar desde 1990 en Cerro Navia. Cortes de vacuno, cerdo, pollo y más — con despacho a domicilio en Santiago.",
};

// Se consulta acá (server component raíz) en vez de en cada sección, para
// no repetir la misma consulta al catálogo varias veces por request — el
// resultado se reparte a todo el árbol vía <Providers> (contexto de
// cliente), incluyendo overlays globales como el modal de cotización.
async function obtenerDatosCatalogo(): Promise<{
  productos: ProductoPublico[];
  comunas: ComunaPublica[];
  cortes: CorteOpcionPublica[];
}> {
  try {
    const [productos, comunas, cortes] = await Promise.all([
      prisma.producto.findMany({ orderBy: { descripcion: "asc" } }),
      prisma.comuna.findMany({ orderBy: { costoEnvio: "asc" } }),
      prisma.corteOpcion.findMany({ orderBy: { orden: "asc" } }),
    ]);
    return { productos: productos.map(aProductoPublico), comunas, cortes };
  } catch (err) {
    console.error("[layout] no se pudo consultar la base de datos:", err);
    return { productos: [], comunas: [], cortes: [] };
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { productos, comunas, cortes } = await obtenerDatosCatalogo();

  return (
    <html lang="es" className={`${abrilFatface.variable} ${asar.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-sans text-text">
        <Providers productos={productos} comunas={comunas} cortes={cortes}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BotonWhatsappFlotante />
          <PopupOferta />
          <CotizadorModal />
          <CarritoDrawer />
          <ConfirmarDrawer />
        </Providers>
      </body>
    </html>
  );
}
