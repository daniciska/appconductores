// E1 · Perfil (demo)
// Ruta: /conductor/perfil
// Maqueta: docs/maqueta/CondPerfil.dc.html
// Lo común con la app real está en ./PerfilBase.tsx. Aquí se agrega lo que solo tiene la demo:
// "Seguridad y privacidad" (Mis documentos y Quién recibió mis datos; sin bloqueos desde el 24-nov),
// "Eliminar mi cuenta" y, al cerrar sesión, la vuelta al menú de la demo.
import { View } from "react-native";
import { useNavigation } from "expo-router";

import { useEntregasDelUsuario, useResumenDocumentos } from "@/datos/hooks";
import {
  FilaLista,
  GrupoLista,
  Insignia,
  TituloSeccion,
  mostrarToast,
  type PropsInsignia,
} from "@/ui";
import { Eye, Trash } from "@/ui/iconos";
import { Hoja } from "@/ui/iconosPropios";

import { irAlSelector } from "./acciones";
import { PerfilBase } from "./PerfilBase";

function SeguridadYPrivacidad() {
  const docs = useResumenDocumentos();
  const entregas = useEntregasDelUsuario();

  const insigniaDocs: PropsInsignia | null =
    docs.rechazados > 0
      ? {
          texto:
            docs.rechazados === 1
              ? "1 no aprobado"
              : `${docs.rechazados} no aprobados`,
          tono: "roja",
          icono: null,
        }
      : docs.vencenPronto > 0
        ? {
            texto:
              docs.vencenPronto === 1
                ? "1 vence pronto"
                : `${docs.vencenPronto} vencen pronto`,
            tono: "amarilla",
            icono: null,
          }
        : docs.enRevision > 0
          ? {
              texto: `${docs.enRevision} en revisión`,
              tono: "gris",
              icono: null,
            }
          : docs.faltan > 0
            ? {
                texto: docs.faltan === 1 ? "Falta 1" : `Faltan ${docs.faltan}`,
                tono: "gris",
                icono: null,
              }
            : null;

  return (
    <View style={{ gap: 8 }}>
      <TituloSeccion>Seguridad y privacidad</TituloSeccion>
      <GrupoLista>
        <FilaLista
          titulo="Mis documentos"
          icono={Hoja}
          href="/conductor/perfil/documentos"
          derecha={insigniaDocs ? <Insignia {...insigniaDocs} /> : undefined}
        />
        <FilaLista
          titulo="Quién recibió mis datos"
          icono={Eye}
          href="/conductor/perfil/quien-recibio"
          derecha={
            entregas.length > 0 ? (
              <Insignia
                texto={String(entregas.length)}
                tono="gris"
                icono={null}
              />
            ) : undefined
          }
        />
      </GrupoLista>
    </View>
  );
}

export default function Perfil() {
  // Navegación de la pila raíz: para volver al selector de la demo.
  const raiz = useNavigation("/");
  return (
    <PerfilBase
      seccionSeguridad={<SeguridadYPrivacidad />}
      filaEliminar={
        <FilaLista
          titulo="Eliminar mi cuenta"
          icono={Trash}
          peligro
          href="/conductor/eliminar-cuenta"
          flecha={false}
        />
      }
      alCerrarSesion={() => {
        mostrarToast("Cerraste sesión.");
        irAlSelector(raiz);
      }}
    />
  );
}
