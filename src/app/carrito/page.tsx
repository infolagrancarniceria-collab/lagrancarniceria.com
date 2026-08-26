import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Carrito from "@/components/Carrito";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu carrito — La Gran Carnicería",
};

export default async function CarritoPage() {
  let comunas: Awaited<ReturnType<typeof prisma.comuna.findMany>> = [];
  try {
    comunas = await prisma.comuna.findMany({ orderBy: { nombre: "asc" } });
  } catch (err) {
    console.error("[carrito] no se pudo consultar comunas:", err);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold">Tu carrito</h1>
      <Carrito comunas={comunas.map((c) => ({ nombre: c.nombre, costoEnvio: c.costoEnvio }))} />
    </div>
  );
}
