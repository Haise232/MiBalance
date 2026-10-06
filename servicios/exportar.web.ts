// En web no hay sistema de archivos ni hoja de compartir: descargamos el archivo directamente.
export async function compartirArchivo(nombre: string, contenido: string, mime: string): Promise<boolean> {
  const blob = new Blob([contenido], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
}
