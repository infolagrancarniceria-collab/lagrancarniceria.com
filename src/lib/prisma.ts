import { PrismaClient } from "@prisma/client";

// Evita crear una nueva conexión en cada hot-reload durante desarrollo
// (patrón recomendado por Prisma para Next.js) — en producción (Vercel,
// una instancia por request/lambda) esto es simplemente el cliente normal.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
