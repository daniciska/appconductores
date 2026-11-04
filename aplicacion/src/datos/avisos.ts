// Avisos breves (toasts). No se guardan: viven solo mientras la página está abierta.
// La interfaz los muestra con <HostAvisos /> (src/ui/Toast.tsx), ya montado en el layout raíz.
import { create } from 'zustand';

export type TipoAviso = 'info' | 'exito' | 'error';

export interface Aviso {
  id: number;
  texto: string;
  tipo: TipoAviso;
}

interface EstadoAvisos {
  avisos: Aviso[];
  quitar: (id: number) => void;
}

let siguiente = 1;

export const useAvisos = create<EstadoAvisos>((set) => ({
  avisos: [],
  quitar: (id) => set((s) => ({ avisos: s.avisos.filter((a) => a.id !== id) })),
}));

/** Muestra un aviso breve abajo de la pantalla (desaparece solo a los ~3 s). */
export function avisar(texto: string, tipo: TipoAviso = 'info', duracionMs = 3200): void {
  const id = siguiente++;
  useAvisos.setState((s) => ({ avisos: [...s.avisos.slice(-2), { id, texto, tipo }] }));
  setTimeout(() => useAvisos.getState().quitar(id), duracionMs);
}
