# La Gran Carnicería — sitio web

Sitio de La Gran Carnicería (lagrancarniceria.cl — Next.js + Prisma/Postgres), con la sección de
precios y despacho sincronizada automáticamente desde el POS
([lagrancarniceria-pos](https://github.com/infolagrancarniceria-collab/lagrancarniceria-pos)).

Esta web es la única pieza que se conecta directamente a la base de datos
compartida — el POS le habla por HTTPS a las rutas `/api/sync/*` (ver
`prisma/schema.prisma` para el detalle de por qué está diseñado así).

## Cómo correrlo en desarrollo

```bash
npm install
cp .env.example .env   # completa DATABASE_URL con la connection string de Postgres
npx prisma migrate dev
npm run dev
```

## Estructura

Sitio de una sola página (catálogo con cotizador que termina el pedido por
WhatsApp) — no hay páginas separadas de precios/carrito, todo vive en `/`.

- `prisma/schema.prisma` — modelo de datos (productos, comunas, opciones de
  corte, pedidos).
- `src/app/layout.tsx` — consulta el catálogo/comunas/cortes una sola vez
  (Server Component) y los reparte a todo el árbol vía `<Providers>`;
  también renderiza el header, footer, y los overlays globales (modal de
  cotización, carrito, confirmación, popup de oferta, botón de WhatsApp).
- `src/app/page.tsx` — arma las secciones de la página (hero, calculadora
  de asados, catálogo, historia, despacho, FAQ, contacto, reseñas).
- `src/components/` — un componente por sección/overlay del sitio.
- `src/lib/` — `cart.tsx` (carrito en localStorage), `ui.tsx` (estado de
  los overlays), `catalogoData.tsx` (contexto con el catálogo ya
  consultado), `whatsapp.ts` (arma el mensaje del pedido), `pricing.ts`,
  `types.ts`, `negocio.ts` (datos reales del negocio para SEO).
- `src/app/api/sync/` — rutas que usa el POS para sincronizar el catálogo
  (`catalogo`), traer pedidos pendientes (`pedidos-pendientes`) y
  confirmarlos (`pedidos-confirmar`). Requieren el header `x-sync-key`
  (ver `SYNC_API_KEY` en `.env.example`).
- `src/app/api/pedidos/` — ruta pública que usa el sitio para crear un
  pedido (retiro en tienda o despacho a domicilio; cotización, no pago).
- `src/app/(admin)/etiquetado/` — módulo interno de etiquetado nutricional
  de productos artesanales (ver sección abajo). El sitio público vive en
  `src/app/(sitio)/`; son dos root layouts separados (route groups).
- `legacy-claude-design/` — diseño anterior hecho con Claude Design
  (export estático de un solo archivo), guardado como referencia de marca
  y contenido — ya no es el código que corre en producción. El logo real
  del negocio (`public/logo.webp`) se rescató de ahí; el resto de las
  imágenes de ese archivo (fotos por producto) parecen ser de un catálogo
  de proveedor/supermercado, no fotos propias — no se usan en el sitio.

## Etiquetado nutricional (`/etiquetado`)

Herramienta interna (no enlazada ni indexada) para calcular la tabla
nutricional y los sellos "ALTO EN" de los productos artesanales, siguiendo el
*Manual de Etiquetado Nutricional de Alimentos* del MINSAL (2017):

- **Ingredientes** con su composición por 100 g. Vienen precargados desde
  USDA FoodData Central (SR Legacy) y son editables. Cada uno indica si
  "adiciona" sodio, azúcares o grasas (Anexo 2 del manual): sin adición no
  corresponde sello aunque se supere el límite.
- **Productos**: receta en "kg de base + cantidades por kg", merma típica,
  porción y datos del rótulo. Muestra una vista previa en vivo de la tabla, los
  sellos y el porqué de cada uno.
- **Lotes**: peso antes y después de la cocción, el ahumado o el secado. La
  etiqueta de un lote usa su merma real; la web usa la del último lote.
- **Etiqueta**: cara principal (con los sellos al tamaño que corresponde según
  el área, pág. 30) y cara de información, impresas a tamaño real desde el
  navegador (Imprimir → Guardar como PDF).
- **Web**: si el producto se vincula a un producto del catálogo y se marca
  "Mostrar en la web", la ficha del cotizador muestra la información nutricional.

Acceso con una sola clave: variable de entorno `ETIQUETADO_CLAVE`. La lógica
del cálculo está en `src/lib/etiquetado/calculo.ts`.
