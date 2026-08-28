import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/negocio";

// Sitio de una sola página — no hace falta más que la home acá.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITIO_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 }];
}
