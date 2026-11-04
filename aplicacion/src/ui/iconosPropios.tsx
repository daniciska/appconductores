// Íconos que no están en lucide, dibujados igual que en las maquetas (mismo trazo de 2 px).
import { forwardRef } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import type { LucideIcon, LucideProps } from './iconos';

/** Volante (Mi experiencia, "Soy conductor"). */
export const Volante = forwardRef<Svg, LucideProps>(function Volante(
  { size = 24, color = '#111111', strokeWidth = 2, ...resto },
  ref,
) {
  return (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...resto}>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="12" r="2.5" />
      <Path d="M12 14.5V21" />
      <Path d="M9.6 11.2 3.4 9.8" />
      <Path d="M14.4 11.2l6.2-1.4" />
    </Svg>
  );
}) as unknown as LucideIcon;

/** Llave del logo de Dale Contacto (va sobre el cuadrado amarillo). */
export const Llave = forwardRef<Svg, LucideProps>(function Llave(
  { size = 24, color = '#111111', strokeWidth = 2.2, ...resto },
  ref,
) {
  return (
    <Svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...resto}>
      <Circle cx="8" cy="15" r="4" />
      <Path d="M10.8 12.2 20 3" />
      <Path d="M16 7l3 3" />
      <Path d="M18 5l2 2" />
    </Svg>
  );
}) as unknown as LucideIcon;

/** Auto de frente, como en "Tengo vehículos". */
export const AutoFrente = forwardRef<Svg, LucideProps>(function AutoFrente(
  { size = 24, color = '#111111', strokeWidth = 2, ...resto },
  ref,
) {
  return (
    <Svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...resto}>
      <Path d="M5 17h14v-5l-2-5H7l-2 5z" />
      <Path d="M5 12h14" />
      <Circle cx="8" cy="17" r="1.5" />
      <Circle cx="16" cy="17" r="1.5" />
    </Svg>
  );
}) as unknown as LucideIcon;

/** Hoja con la esquina doblada, sin líneas (documentos en las maquetas B5, E1 y E2). */
export const Hoja = forwardRef<Svg, LucideProps>(function Hoja(
  { size = 24, color = '#111111', strokeWidth = 2, ...resto },
  ref,
) {
  return (
    <Svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...resto}>
      <Path d="M14 3H6v18h12V7z" />
      <Path d="M14 3v4h4" />
    </Svg>
  );
}) as unknown as LucideIcon;

/** "Cerrar sesión" (maqueta E1): marco a la derecha y flecha hacia la izquierda. */
export const CerrarSesion = forwardRef<Svg, LucideProps>(function CerrarSesion(
  { size = 24, color = '#111111', strokeWidth = 2, ...resto },
  ref,
) {
  return (
    <Svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...resto}>
      <Path d="M15 4h4v16h-4" />
      <Path d="M10 8l-4 4 4 4" />
      <Path d="M6 12h10" />
    </Svg>
  );
}) as unknown as LucideIcon;
