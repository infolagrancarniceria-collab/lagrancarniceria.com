// Achica una imagen en el navegador (sin recortar) y la convierte a WebP;
// si el navegador no sabe codificar WebP (algunos Safari antiguos), usa
// JPEG. Se usa antes de subir fotos de productos y diseños de etiqueta.
export async function optimizarImagen(archivo: File, ladoMax: number, calidad = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no pudo procesar la imagen");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const codificar = (tipo: string) => new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, tipo, calidad));
  let blob = await codificar("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await codificar("image/jpeg");
  if (!blob) throw new Error("El navegador no pudo convertir la imagen");
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `imagen.${ext}`, { type: blob.type });
}
