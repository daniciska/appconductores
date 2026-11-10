// Configuración pública de la app real. Expo reemplaza las variables EXPO_PUBLIC_* al armar el paquete
// (archivo .env de esta carpeta, versionado a propósito: todo lo de aquí es público por diseño). Se leen
// solo aquí, dentro de app-real/src, y con la forma process.env.NOMBRE (Expo no reemplaza otras formas).
// Si falta una o la clave parece secreta, la app no arranca (y scripts/exportar.mjs no arma el sitio).
import { revisarConfiguracion } from './configuracion';

export const CONFIG = revisarConfiguracion({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  clave: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  codigosDePrueba: process.env.EXPO_PUBLIC_CODIGOS_DE_PRUEBA,
});
