# Seguridad de Supabase

miBalance usa la **anon key** de Supabase (`EXPO_PUBLIC_SUPABASE_ANON_KEY`). Esa clave **es pública por diseño**: va incrustada en el bundle de la app. Por eso toda la seguridad depende de **Row Level Security (RLS)**.

## Qué garantiza el schema
`scripts/supabase-schema-es.sql` (idempotente, se puede ejecutar varias veces):

- RLS activado en `transacciones`, `cuentas`, `deudas`, `categorias` y `suscripciones`.
- Una política por tabla, `TO authenticated`, con `USING` y `WITH CHECK` sobre `usuario_id = auth.uid()`.
- `usuario_id` se rellena solo con `default auth.uid()`; un insert o update con un `usuario_id` ajeno falla.
- Índice en `usuario_id` y `REVOKE` al rol `anon`.

## Reglas del proyecto
- Nunca uses la `service_role` / `sb_secret_*` en el cliente ni en el repositorio.
- No crees funciones RPC `SECURITY DEFINER` (p. ej. `exec_sql`) expuestas a `anon`.
- Las claves reales van solo en `.env` (ignorado por Git). Usa `.env.example` como plantilla.

## Checklist en el panel de Supabase
1. Rotar cualquier `secret key` o contraseña de base de datos que haya estado en un repositorio.
2. Authentication → activar *Confirm email*; en URL Configuration dejar solo las Redirect URLs reales (`mibalance://` y la URL web).
3. Authentication → Rate Limits: bajar registros e inicios de sesión por IP; activar CAPTCHA y contraseñas mínimas de 8+ caracteres.
4. Si la app es de uso cerrado, desactivar *Allow new users to sign up*.
5. Data API: exponer solo el esquema `public`.
6. Comprobar funciones expuestas: `select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public';` y eliminar `exec_sql` si existe.
7. Comprobar tablas sin RLS (debe dar 0 filas): `select tablename from pg_tables where schemaname = 'public' and not rowsecurity;`
8. Database → Advisors → Security Advisor sin avisos críticos.
9. Prueba con dos usuarios (A y B): B no ve, edita ni borra filas de A; un insert con `usuario_id` ajeno falla; sin sesión se obtienen 0 filas.

## Notas
- `app/(pestañas)/yo.tsx` borra datos con `.delete().neq('id', 0)`: RLS lo limita a las filas del usuario autenticado.
- Para reportar una vulnerabilidad, consulta [SECURITY.md](../SECURITY.md).
