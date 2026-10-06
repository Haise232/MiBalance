import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Guarda `contenido` en un archivo y abre el menú de compartir del sistema.
 * Devuelve false si compartir no está disponible en el dispositivo.
 */
export async function compartirArchivo(nombre: string, contenido: string, _mime: string): Promise<boolean> {
  const uri = FileSystem.cacheDirectory + nombre;
  await FileSystem.writeAsStringAsync(uri, contenido, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri);
  return true;
}
