# PROYECTO: SocialFlow SaaS - Especificación Técnica Completa

## 1. Visión y Alcance

Construir una plataforma SaaS B2B "Multi-Tenant" para agencias de marketing.
**Core Value:** Centralizar la gestión de clientes, automatizar la organización de archivos en Google Drive y programar contenido en Redes Sociales.
**Arquitectura:** Híbrida (Vercel Frontend/Logic + Firebase Backend/Data).

## 2. Stack Tecnológico (Innegociable)

- **Framework:** Next.js 15 (App Router, Server Actions).
- **Lenguaje:** TypeScript (Strict Mode). **Prohibido usar `any`.**
- **Hosting:** Vercel (Production) / Localhost (Dev).
- **Auth:** Firebase Auth (Client SDK) + Firebase Admin (Server SDK).
- **DB:** Firestore (NoSQL).
- **Storage:**
  - _Media:_ Google Drive API v3 (Service Account centralizada).
  - _Assets:_ Firebase Storage.
- **UI:** TailwindCSS + Shadcn/UI + Lucide Icons.
- **State:** React Server Components (RSC) para data fetching, React Context para estado de sesión global.

## 3. Arquitectura de Directorios (Feature-Based)

Organización modular para facilitar el mantenimiento por IA:

```text
/src
  /app
    /(auth)/login          # Login público
    /(dashboard)/[agencyId]# Rutas privadas (Layout con Sidebar)
       /clients            # CRUD Clientes
       /calendar           # Vista Calendario
       /settings           # Configuración (Conexión APIs)
    /(portal)/p/[token]    # Vista pública del cliente (Layout limpio)
  /features                # Lógica de Negocio Agrupada
    /auth                  # Hooks, componentes de login
    /drive                 # Lógica de creación de carpetas, subidas
    /social                # Lógica de conexión con Meta/TikTok
    /content-item          # Lógica de la tarjeta de contenido/estado
  /lib
    firebase.ts            # Cliente (Solo Auth)
    firebase-admin.ts      # Servidor (DB & Auth Admin)
    google-drive.ts        # Helper class para Drive API
  /actions                 # Server Actions (Mutaciones seguras)

```

## 4. Esquema de Datos (Firestore Schema)

El agente debe respetar estrictamente estos nombres de campos y tipos.

### `agencies` (Collection Root)

- `id`: string
- `owner_uid`: string (UID del Firebase Auth)
- `name`: string
- `plan`: 'free' | 'pro'
- `created_at`: timestamp
- `settings`: { `drive_root_folder_id`: string }

### `agencies/{agencyId}/clients` (Subcollection)

- `id`: string
- `name`: string
- `logo_url`: string
- `drive_folder_id`: string (Carpeta específica de este cliente)
- `portal_token`: string (UUID para acceso público)
- `social_accounts`: {
  `instagram`: { `connected`: boolean, `access_token`: string, `page_id`: string },
  `tiktok`: { `connected`: boolean, `access_token`: string }
  }

### `agencies/{agencyId}/content` (Subcollection)

- `id`: string
- `client_id`: string (Reference)
- `title`: string
- `status`: 'idea' | 'scripting' | 'ready_to_film' | 'filmed' | 'review' | 'approved' | 'scheduled' | 'published'
- `script_data`: { `hook`: string, `body`: string, `cta`: string }
- `media`: { `drive_file_id`: string, `download_url`: string, `mime_type`: string }
- `schedule_date`: timestamp
- `assigned_user_uid`: string

## 5. Reglas de Negocio Críticas (Logic Constraints)

### A. Seguridad & Multi-Tenancy

1. **Middleware:** Toda ruta bajo `/dashboard` debe verificar que el usuario tenga una sesión activa Y que su `uid` pertenezca a la `agencyId` de la URL.
2. **Server Actions:** Nunca confiar en el cliente. Antes de escribir en Firestore, la Action debe validar `auth().verifyIdToken()` y comprobar permisos.

### B. Integración Google Drive (Service Account)

1. Al registrar una agencia -> Crear carpeta raíz "Agency [Name]".
2. Al crear un cliente -> Crear subcarpeta dentro de la raíz de la agencia.
3. La Service Account debe ser "Editor" de la carpeta, pero los archivos deben ser visibles para la App.

### C. Flujo de Estados (State Machine)

El cambio de estado debe ser estricto:

- `idea` -> `scripting` (Al generar con IA).
- `scripting` -> `ready_to_film` (Al aprobar guion en Portal/Dashboard).
- `filmed` -> `review` (Al subir video a Drive).
- `review` -> `approved` (Aprobación Cliente).
- `approved` -> `scheduled` (Integración con API social).

## 6. Instrucciones de UI/UX

- **Tema:** Dark Mode por defecto (estética "Cyberpunk Professional").
- **Componentes:** Usar `shadcn` para todo (Tables, Dialogs, Sheets, Forms).
- **Feedback:** Usar `sonner` (Toast notifications) para cada acción (éxito/error).
- **Loading:** Usar `Skeleton` loaders mientras cargan los datos de Firestore.

## 7. Plan de Ejecución Secuencial

No intentes hacer todo a la vez. Sigue este orden:

1. **Infra:** Configurar Firebase Admin y Helpers de Drive.
2. **Auth:** Login y creación de perfil de Agencia.
3. **Clients:** CRUD de clientes + Creación automática de carpetas Drive.
4. **Content:** CRUD de ideas + Conexión IA (Gemini).
5. **Portal:** Vista pública de solo lectura/aprobación.
