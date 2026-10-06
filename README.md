# MiBalance

Controla tus ingresos, gastos, deudas y suscripciones en un solo lugar. Aplicación de finanzas personales multiplataforma (Android, iOS y web) con datos por usuario en Supabase.

![Expo SDK 54](https://img.shields.io/badge/Expo%20SDK-54-000020?logo=expo&logoColor=white)
![React Native 0.81](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Licencia: propietaria](https://img.shields.io/badge/Licencia-Propietaria-red)

> **Código visible solo para consulta.** Este repositorio es público únicamente para que se pueda ver. No se concede permiso de uso, copia, modificación ni distribución. Consulta [Licencia](#licencia).

## Capturas

<!-- TODO: añadir capturas reales (por ejemplo en docs/capturas/) y enlazarlas aquí.
![Inicio](docs/capturas/inicio.png)
![Movimientos](docs/capturas/movimientos.png)
![Reportes](docs/capturas/reportes.png)
-->

_Pendiente de añadir._

## Funcionalidades

- **Inicio y movimientos**: registro de ingresos y gastos (pantalla `agregar`), listado de movimientos y resumen de saldo.
- **Cuentas**: gestión de cuentas (`app/cuentas.tsx`).
- **Categorías**: gestión de categorías (`app/categorias.tsx`).
- **Deudas**: alta de deudas y registro de abonos (`app/deudas.tsx`).
- **Suscripciones**: control de pagos recurrentes (`app/suscripciones.tsx`).
- **Reportes**: pestaña de reportes con gráficos (`app/(pestañas)/reportes.tsx`).
- **Autenticación**: registro e inicio de sesión con Supabase Auth, pantalla de bienvenida y tutorial inicial.
- **Tema claro/oscuro** (`contextos/TemaContexto.tsx`; `userInterfaceStyle: automatic` en `app.json`).
- **Web y móvil responsive**: barra de pestañas flotante en móvil y barra lateral en pantallas de 920 px o más.
- **Atajo de teclado (solo web)**: `n` abre «nuevo movimiento».
- **Copias de seguridad**: exportar movimientos a CSV, exportar copia completa en JSON e importar/restaurar desde un JSON (Ajustes).
- **Recordatorios diarios**: notificaciones locales con `expo-notifications` (solo móvil; en web se ocultan).
- **Actualizaciones OTA** con EAS Update.

## Stack

| Área | Tecnología |
|---|---|
| Framework | Expo SDK ~54, React Native 0.81.5, React 19.1 |
| Navegación | Expo Router ~6 (rutas tipadas), React Navigation |
| Lenguaje | TypeScript ~5.9 |
| Backend | Supabase (`@supabase/supabase-js`): Auth + Postgres con RLS |
| Web | `react-native-web` |
| Otros | `expo-notifications`, `expo-updates`, `expo-sharing`, `expo-document-picker`, `expo-sqlite`, `react-native-reanimated` |

## Estructura del proyecto

```text
app/               Rutas (Expo Router): login, registro, bienvenida, tutorial,
                   agregar, cuentas, categorias, deudas, suscripciones
  (pestañas)/      Pestañas: index (Inicio), movimientos, reportes, yo (Ajustes)
componentes/       UI reutilizable (cuentas, deudas, suscripciones, tutorial,
                   navegacion con BarraLateral, web, lista, etc.)
constantes/        layout.ts (breakpoints), plataforma.ts, tema.ts
contextos/         SesionContexto, TemaContexto
hooks/             useDiseno, useAtajosTeclado, useTituloDocumento
servicios/         supabase.ts, baseDatos.ts, exportar(.web).ts,
                   notificaciones.ts, avisos.ts
  datos/           Acceso a datos por entidad (movimientos, cuentas, categorias,
                   deudas, suscripciones, resumen, respaldo, ...)
scripts/           supabase-schema-es.sql, fix-multiuser-security.sql
docs/              Planes y notas internas (docs/qa)
assets/            Logo e imágenes
```

## Requisitos

- Node.js y npm (el repo incluye `package-lock.json`).
- Un proyecto de [Supabase](https://supabase.com/).
- Para móvil: la app **Expo Go** no es suficiente de forma garantizada, ya que el proyecto incluye `expo-dev-client`; usa un build de desarrollo (ver [Despliegue](#despliegue)) o un emulador.

## Instalación

```bash
git clone https://github.com/Haise232/MiBalance.git
cd MiBalance
npm install
cp .env.example .env
```

## Configuración

### Variables de entorno

Edita `.env` con los datos de tu proyecto de Supabase (Project Settings → API):

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-o-publishable-key
```

- Las variables `EXPO_PUBLIC_*` se incrustan en el bundle de la app.
- `.env` está en `.gitignore`. No subas claves reales.
- Si faltan, `servicios/supabase.ts` avisa por consola.

### Base de datos (Supabase)

1. Abre **SQL Editor** en tu panel de Supabase.
2. Ejecuta el contenido de [`scripts/supabase-schema-es.sql`](scripts/supabase-schema-es.sql). Crea las tablas `transacciones`, `cuentas`, `deudas`, `categorias` y `suscripciones`, activa **Row Level Security** en todas y añade políticas por `usuario_id = auth.uid()`.
3. Si ya tenías tablas sin `usuario_id`, existe [`scripts/fix-multiuser-security.sql`](scripts/fix-multiuser-security.sql) para añadir la columna y ajustar la seguridad multiusuario.

## Comandos

| Comando | Acción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo (`expo start`) |
| `npm run web` | Inicia en web |
| `npm run android` | Inicia en Android |
| `npm run ios` | Inicia en iOS |
| `npm run lint` | ESLint (`expo lint`) |
| `npm run typecheck` | Comprobación de tipos (`tsc --noEmit`) |

## Despliegue

Configuración en [`eas.json`](eas.json) y `app.json`:

- **Perfiles de build**: `development` (development client, distribución interna), `preview` (distribución interna, canal `preview`) y `production` (`autoIncrement`).
- **EAS Update**: habilitado (`checkAutomatically: ON_LOAD`), con `runtimeVersion` según `appVersion`.

```bash
eas build --profile development
eas build --profile preview
eas update --channel preview
eas build --profile production
```

Necesitas EAS CLI y una cuenta de Expo; el `projectId` y el `owner` de `app.json` pertenecen al proyecto original, así que cámbialos si usas tu propia cuenta.

## Seguridad

- Todas las tablas usan **Row Level Security**: cada usuario solo accede a sus filas.
- La anon/publishable key de Supabase es pública por diseño (viaja en el bundle); la protección real son las políticas RLS. Nunca uses la `service_role`/secret key en el cliente ni la subas al repositorio.
- Políticas de seguridad: [SECURITY.md](SECURITY.md) y [docs/SEGURIDAD_SUPABASE.md](docs/SEGURIDAD_SUPABASE.md).

## Diseño responsive

Breakpoints definidos en `constantes/layout.ts`: móvil (0), tablet (600 px) y escritorio (920 px). Desde 920 px se muestra `BarraLateral`; por debajo, la barra de pestañas flotante. El contenido tiene anchos máximos según el tipo de pantalla (formulario 600, contenido 760, lista 640, auth 440).

## Roadmap

- Añadir capturas de pantalla.
- Mejoras de accesibilidad (objetivos táctiles, etiquetas y roles en controles).
- Completar la documentación de seguridad.

## Licencia

Copyright (c) 2026 Haise232. **All rights reserved.** Licencia propietaria: el código es visible solo para consulta y no se permite su uso, copia, modificación ni distribución sin autorización por escrito. Ver [LICENSE](LICENSE).
