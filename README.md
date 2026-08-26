# lagrancarniceria.com

Sitio de La Gran Carnicería (Next.js + Prisma/Postgres), con la sección de
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

- `prisma/schema.prisma` — modelo de datos (productos, comunas, opciones de
  corte, pedidos).
- `src/app/precios/` — página de precios y despacho, leída directo de
  Postgres (Server Component).
- `src/app/api/sync/` — rutas que usa el POS para sincronizar el catálogo
  (`catalogo`), traer pedidos pendientes (`pedidos-pendientes`) y
  confirmarlos (`pedidos-confirmar`). Requieren el header `x-sync-key`
  (ver `SYNC_API_KEY` en `.env.example`).
- `src/app/api/pedidos/` — ruta pública que usa el sitio para crear un
  pedido de despacho (cotización, no pago).
- `legacy-claude-design/` — diseño anterior hecho con Claude Design
  (export estático de un solo archivo), guardado como referencia de marca
  y contenido — ya no es el código que corre en producción.
