import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de producto subidas desde /etiquetado/fotos (Vercel Blob).
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: {
      // Las fotos se achican en el navegador antes de subirlas (~100-300 KB),
      // pero se deja margen por si un navegador no puede convertir a WebP.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
