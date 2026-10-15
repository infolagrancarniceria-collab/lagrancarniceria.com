import type { MedioPago, TipoEntrega } from "./types";

// Datos del cliente que conviene recordar para agilizar el próximo pedido
// — solo en el navegador del cliente (localStorage), nunca se mandan a
// ningún otro lado ni se guardan en el servidor. fechaEntrega/comentario
// quedan fuera a propósito: son de un pedido puntual, no del cliente.
export interface ClienteGuardado {
  nombre: string;
  telefono: string;
  tipoEntrega: TipoEntrega;
  comunaNombre: string | null;
  direccion: string | null;
  medioPago: MedioPago | "";
}

const STORAGE_KEY = "lgc-cliente";

export function cargarClienteGuardado(): ClienteGuardado | null {
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    return guardado ? (JSON.parse(guardado) as ClienteGuardado) : null;
  } catch {
    return null;
  }
}

// Combina con lo que ya había guardado en vez de reemplazarlo entero —
// así, por ejemplo, un pedido con "Retiro en tienda" no borra la
// comuna/dirección que había quedado guardada de un pedido anterior con
// despacho.
export function guardarClienteGuardado(datos: Partial<ClienteGuardado>): void {
  try {
    const actual = cargarClienteGuardado() ?? {};
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...actual, ...datos }));
  } catch {
    // localStorage no disponible (ej. modo privado) — el pedido sigue
    // funcionando igual, solo no se recuerda para la próxima vez.
  }
}

export function olvidarClienteGuardado(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ver comentario arriba
  }
}
