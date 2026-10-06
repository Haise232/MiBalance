import { useWindowDimensions } from 'react-native';

import { AnchoMax, Breakpoints, type ClaseDiseno } from '@/constantes/layout';

export const ANCHO_ESCRITORIO = Breakpoints.escritorio;

/** Breakpoints compartidos para adaptar las pantallas a tablet y escritorio. */
export function useDiseno() {
  const { width } = useWindowDimensions();
  const clase: ClaseDiseno =
    width >= Breakpoints.escritorio ? 'escritorio' : width >= Breakpoints.tablet ? 'tablet' : 'movil';
  return {
    ancho: width,
    esAncho: width >= ANCHO_ESCRITORIO,
    esTablet: clase === 'tablet',
    clase,
    anchoContenido: Math.min(width, AnchoMax.contenido),
  };
}
