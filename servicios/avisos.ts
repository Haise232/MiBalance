import { Alert, Platform } from 'react-native';

// Alert.alert no hace nada en react-native-web, así que en web usamos window.alert.
export function mostrarAviso(titulo: string, mensaje?: string) {
  if (Platform.OS === 'web') {
    window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    return;
  }
  Alert.alert(titulo, mensaje);
}
