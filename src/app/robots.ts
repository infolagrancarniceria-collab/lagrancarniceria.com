import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/negocio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/etiquetado" },
    sitemap: `${SITIO_URL}/sitemap.xml`,
  };
}
