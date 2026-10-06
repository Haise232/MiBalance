# Política de seguridad

## Cómo reportar una vulnerabilidad

No abras issues públicos para temas de seguridad. Usa los **GitHub Security Advisories privados**:
pestaña **Security** del repositorio, **Report a vulnerability**.

Intentaremos responder en un plazo razonable y coordinar la divulgación una vez corregido el problema.

## Alcance

Incluye: código de la app (`app/`, `componentes/`, `servicios/`, `contextos/`), el esquema SQL y las políticas RLS
(`scripts/supabase-schema-es.sql`) y los workflows de CI.

Fuera de alcance: vulnerabilidades en servicios de terceros (Supabase, Expo, GitHub) que deben reportarse a sus
proveedores, y ataques que requieran acceso físico o dispositivo comprometido.

## Nota sobre Supabase

La `anon key` de Supabase es **pública por diseño**: va incluida en la app cliente. Su exposición no es una
vulnerabilidad. La seguridad de los datos depende por completo de las políticas **Row Level Security (RLS)**; los
reportes sobre RLS ausente o mal configurada son de alta prioridad. La `service_role key` nunca debe estar en el
repositorio ni en la app.
