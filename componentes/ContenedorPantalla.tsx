import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AnchoMax, type VarianteAncho } from '@/constantes/layout';

type Props = {
  /** Tope de ancho según el tipo de pantalla. */
  variante: Exclude<VarianteAncho, 'tutorial'>;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Centra el contenido y limita su ancho en tablet/escritorio. */
export function ContenedorPantalla({ variante, style, children }: Props) {
  return (
    <View
      style={[{ flex: 1, width: '100%', alignSelf: 'center', maxWidth: AnchoMax[variante] }, style]}
    >
      {children}
    </View>
  );
}

export default ContenedorPantalla;
