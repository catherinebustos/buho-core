# BúhoOps — App (Fase 1)

Next.js 14 (App Router) + Supabase + Tailwind + shadcn-style UI.
Fase 1 del MVP: propiedades, catálogos y flujo QR de visitas.

## Setup

```bash
cd BúhoOps/app
npm install
cp .env.example .env.local
# edita .env.local con tus claves de Supabase
npm run dev
```

### Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=...   # opcional, reservada para server-side admin
```

## Primer arranque (después de conectar Supabase)

1. Ejecuta las 7 migraciones de `../supabase/migrations/` en orden, desde el
   SQL editor de Supabase o con `supabase db push`.
2. Crea un usuario en Supabase Auth (Authentication → Users → Add user).
3. Inserta manualmente su perfil en `profiles` con `role='super_admin'`:
   ```sql
   insert into profiles (id, universal_code, full_name, email, role)
   values ('<auth-user-id>', 'BUHO-001', 'Matías Arrieta', 'tu@correo.cl', 'super_admin');
   ```
4. `npm run dev` → http://localhost:3000 → login con ese usuario.
5. Regenera los tipos TS desde Supabase:
   ```bash
   npm run types:gen
   ```
   y cambia los imports de `@/lib/types/database` a `@/lib/types/database.generated`.

## Estructura

```
app/
├── middleware.ts                 # session refresh + redirect a /login
├── src/
│   ├── app/
│   │   ├── layout.tsx            # root layout (fonts, globals)
│   │   ├── page.tsx              # redirect por auth
│   │   ├── login/                # login público
│   │   ├── (app)/                # layout protegido con sidebar
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx                (lista + filtros)
│   │   │   │   ├── new/
│   │   │   │   ├── [id]/                    (detalle + QR + asignaciones)
│   │   │   │   │   └── edit/
│   │   │   │   └── actions.ts
│   │   │   └── catalogs/
│   │   │       ├── page.tsx                (índice)
│   │   │       ├── property-types/
│   │   │       ├── item-categories/
│   │   │       ├── items/
│   │   │       ├── suppliers/
│   │   │       ├── visit-types/
│   │   │       └── actions.ts
│   │   └── v/[token]/            # flujo QR (mobile-first)
│   │       ├── page.tsx          (formulario de visita)
│   │       ├── actions.ts
│   │       └── success/
│   ├── components/
│   │   ├── ui/                   (button, input, card, table, etc.)
│   │   ├── layout/               (sidebar, user-menu)
│   │   ├── properties/           (form, assignments-panel, qr-preview)
│   │   └── catalogs/             (simple-catalog reutilizable)
│   └── lib/
│       ├── supabase/             (client, server, middleware)
│       ├── types/database.ts     (tipos a mano hasta gen:types)
│       ├── auth.ts               (requireProfile, requireRole, hasRoleAtLeast)
│       └── utils.ts
```

## Roles y acceso

| Rol | Ve |
|---|---|
| `super_admin` | Todo |
| `admin` | Propiedades, catálogos, usuarios (sin auditoría global) |
| `supervisor` | Propiedades (solo las que supervisa) + visitas + ocupaciones |
| `cleaner` | Propiedades asignadas + registro de visitas por QR |

La visibilidad real se aplica vía **RLS** en la DB — el sidebar solo oculta
secciones, no reemplaza las políticas.

## Flujo QR

1. Admin crea la propiedad → sistema genera `qr_token`.
2. Admin descarga el QR desde `/properties/[id]` (PNG).
3. El QR apunta a `NEXT_PUBLIC_APP_URL/v/<token>`.
4. Al escanearlo, el personal debe estar logueado (middleware redirige a
   `/login?next=/v/<token>`).
5. Carga el formulario mobile-first → registra visita + consumibles usados
   + daños opcionales.
6. Al guardar, se crea `visits`, `visit_items_used` y opcionalmente
   `damage_reports`.

## Qué queda para Fase 2+

- Tickets de compra (módulo completo con desglose por ítem y foto)
- Ocupaciones (registro y alertas de inconsistencia)
- Reportes mensuales y KPIs visuales
- Export PDF/Excel
- Subida de fotos a Supabase Storage (propiedades + visitas)
- Auditoría UI
- PWA con cola offline para limpiadores
- Gestión de usuarios desde UI (hoy se hace por SQL)

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción
npm run start      # servidor de producción
npm run lint       # eslint
npm run types:gen  # regenerar tipos desde Supabase
```

## Estado Actual (Abril 2026)

- Refactorización de tipos completada para utilizar helpers `Tables` y `Enums`.
- Fix de casting dinámico implementado para asegurar despliegues exitosos en Vercel.
- Documentación técnica interna actualizada en el sistema de conocimiento del agente.
