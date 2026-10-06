# Licencias de terceros

miBalance (c) 2026 Haise232 es software propietario (ver `LICENSE`). Usa
componentes de terceros que conservan sus propias licencias. Este documento es
un resumen informativo basado en los campos `license` de `package-lock.json`
(revisión del 2026-10-05); no sustituye los textos de licencia originales.
Se revisaron ~1000 paquetes (directos y transitivos).

## Resultado de la revisión de copyleft

- No hay paquetes GPL, AGPL ni LGPL puros en el árbol de dependencias.
- `node-forge` (transitiva, herramientas de Expo) declara
  `(BSD-3-Clause OR GPL-2.0)`: se acoge a la opción BSD-3-Clause. Sin conflicto.
- `lightningcss` y sus binarios (transitiva, herramientas de build/web, MPL-2.0):
  copyleft débil a nivel de archivo; solo obliga si se modifican y distribuyen
  esos archivos. No contagia el código propio. Conservar su aviso.
- `caniuse-lite` (CC-BY-4.0, datos de build) y `argparse` (Python-2.0, dev):
  no se incluyen en la app distribuida; la primera requiere atribución si se
  redistribuye.
- Otras licencias permisivas menores: BlueOak-1.0.0, 0BSD, Unlicense,
  `(MIT OR CC0-1.0)`.

## Dependencias directas (aprox. según package.json; verificar versión exacta)

| Paquete | Licencia |
|---|---|
| react, react-dom, react-native, react-native-web | MIT |
| expo y paquetes `expo-*` (constants, dev-client, document-picker, file-system, font, haptics, image, image-picker, linking, notifications, router, sharing, splash-screen, sqlite, status-bar, symbols, system-ui, updates, web-browser) | MIT |
| @expo/vector-icons | MIT (ver nota de fuentes) |
| @react-native-async-storage/async-storage | MIT |
| @react-native-community/datetimepicker | MIT |
| @react-navigation/bottom-tabs, elements, native | MIT |
| @supabase/supabase-js | MIT |
| react-native-gesture-handler, react-native-reanimated, react-native-screens, react-native-safe-area-context, react-native-worklets | MIT |
| react-native-url-polyfill | MIT |
| (dev) typescript | Apache-2.0 |
| (dev) eslint, eslint-config-expo, @types/react, pg | MIT |

Casi todas las licencias MIT/Apache-2.0/BSD exigen conservar el aviso de
copyright y el texto de licencia al redistribuir el software (incluida la app
compilada). Apache-2.0 además exige conservar los archivos NOTICE si existen.

## Atribuciones necesarias

- Al publicar la app compilada (tiendas), incluir una pantalla o archivo de
  "Licencias de código abierto" con los avisos de copyright y textos de
  licencia de las dependencias incluidas en el bundle. Se puede generar con
  una herramienta de licencias (p. ej. `license-checker`/`license-report`)
  sobre las dependencias de producción.
- Este documento no sustituye ese listado completo.

## Fuentes, iconos y assets

- `@expo/vector-icons` incluye varias familias de iconos/fuentes con
  licencias propias (p. ej. Ionicons MIT, MaterialIcons Apache-2.0,
  FontAwesome con fuente OFL-1.1 e iconos CC-BY-4.0, entre otras). Si se
  usan, conservar sus avisos en el listado de licencias de la app.
- `expo-symbols` usa SF Symbols de Apple solo en iOS: sujeto a la licencia de
  Apple, utilizable únicamente en apps para plataformas Apple.
- `assets/logo/Logo.jpeg`, `assets/logo/logo-mark.png` y
  `assets/images/favicon.png`: no se pudo verificar su autoría desde el
  código. Si son creación propia, quedan cubiertos por `LICENSE` (todos los
  derechos reservados, incluido el uso de la marca). Si alguno proviene de
  un banco de imágenes, plantilla o generador de IA, el propietario debe
  confirmar que su licencia permite el uso comercial y registrar aquí la
  fuente. Las imágenes de plantilla por defecto de Expo (icono, splash) se
  rigen por MIT del proyecto de plantilla.
- No se detectaron fuentes tipográficas propias en `assets/`.

## Servicios externos

Supabase y Expo (EAS) se usan como servicios; sus términos de servicio
aplican por separado y no son licencias de código.
