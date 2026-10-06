import { Platform } from 'react-native';

/** Banderas de plataforma centralizadas (evita `Platform.OS` suelto en pantallas). */
export const ES_WEB: boolean = Platform.OS === 'web';

export const ES_IOS: boolean = Platform.OS === 'ios';
export const ES_ANDROID: boolean = Platform.OS === 'android';

/** El autoFocus solo es seguro en web; en nativo abre el teclado sin gesto del usuario. */
export const AUTOFOCUS_WEB: boolean = ES_WEB;

/** Mostrar la barra de scroll solo en web. */
export const MOSTRAR_BARRA_SCROLL: boolean = ES_WEB;

/** Comportamiento de KeyboardAvoidingView: 'padding' iOS, 'height' Android, ninguno en web. */
export const COMPORTAMIENTO_TECLADO: 'padding' | 'height' | undefined =
  Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined;
