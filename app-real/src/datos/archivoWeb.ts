// Elegir el archivo del documento en el navegador del celular y achicar las fotos antes de subirlas.
//   - Fotos: el selector con accept="image/*" ofrece en iPhone "Tomar foto", "Fototeca" o "Archivos" y en
//     Android la cámara o la galería. PDF: el selector de archivos.
//   - Una foto de celular pesa 3 a 12 MB. Si pasa de 1,5 MB o de 2.400 px por lado, se redibuja en JPEG
//     (calidad 0,85, hasta 2.400 px): se lee igual de bien y sube mucho más rápido. Si el navegador no
//     puede leerla (por ejemplo, una HEIC en Android), se sube tal cual.
import { Platform } from 'react-native';

export interface ArchivoElegido {
  archivo: Blob;
  nombre: string;
  /** Tipo declarado por el navegador (puede venir vacío). */
  tipo: string;
  /** Para mostrar la foto antes de subirla (blob:…); null en los PDF. Hay que liberarla con URL.revokeObjectURL. */
  vista: string | null;
}

/** Abre el selector del navegador. null si se cerró sin elegir (o fuera de la web). */
export function elegirArchivo(acepta: string): Promise<ArchivoElegido | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolver) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acepta;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    let listo = false;
    const terminar = (f: File | null) => {
      if (listo) return;
      listo = true;
      input.remove();
      if (!f) {
        resolver(null);
        return;
      }
      const esImagen = /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name);
      resolver({ archivo: f, nombre: f.name, tipo: f.type, vista: esImagen ? URL.createObjectURL(f) : null });
    };
    input.addEventListener('change', () => terminar(input.files?.[0] ?? null));
    input.addEventListener('cancel', () => terminar(null));
    document.body.appendChild(input);
    input.click();
  });
}

const LADO_MAXIMO = 2400;
const BYTES_SIN_ACHICAR = 1.5 * 1024 * 1024;

function cargarImagen(url: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => rechazar(new Error('No se pudo leer la imagen'));
    img.src = url;
  });
}

/**
 * Deja la foto lista para subir: si es grande, la redibuja en JPEG. Devuelve el archivo y su tipo
 * (los PDF y lo que no se pueda leer vuelven tal cual).
 */
export async function prepararFoto(archivo: Blob, mime: string): Promise<{ archivo: Blob; mime: string }> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return { archivo, mime };
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) return { archivo, mime };
  const url = URL.createObjectURL(archivo);
  try {
    const img = await cargarImagen(url);
    const lado = Math.max(img.naturalWidth, img.naturalHeight);
    if (archivo.size <= BYTES_SIN_ACHICAR && lado <= LADO_MAXIMO && mime !== 'image/heic' && mime !== 'image/heif') return { archivo, mime };
    const escala = Math.min(1, LADO_MAXIMO / lado);
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(img.naturalWidth * escala);
    lienzo.height = Math.round(img.naturalHeight * escala);
    const ctx = lienzo.getContext('2d');
    if (!ctx) return { archivo, mime };
    // Fondo blanco (una PNG con transparencia no queda negra en JPEG).
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    const jpeg = await new Promise<Blob | null>((r) => lienzo.toBlob(r, 'image/jpeg', 0.85));
    if (!jpeg || jpeg.size === 0 || jpeg.size >= archivo.size) return { archivo, mime };
    return { archivo: jpeg, mime: 'image/jpeg' };
  } catch {
    return { archivo, mime };
  } finally {
    URL.revokeObjectURL(url);
  }
}
