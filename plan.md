# PROYECTO: SocialFlow SaaS (Vercel + Firebase Architecture)

## 1. Misión del Proyecto

Construir una plataforma SaaS escalable para la gestión, aprobación y programación de contenido en redes sociales.
**Objetivo Técnico:** Orquestar una arquitectura híbrida donde **Vercel** maneja el Frontend y la Lógica (Server Actions) y **Firebase** maneja la Persistencia y Autenticación.

## 2. Stack Tecnológico (Estricto)

El agente NO debe desviarse de estas tecnologías:

- **Core Framework:** Next.js 15 (App Router).
- **Lenguaje:** TypeScript (Strict Mode).
- **Hosting & Edge:** Vercel (Configurado para Serverless Functions).
- **Base de Datos:** Firebase Firestore (NoSQL).
- **Autenticación:** Firebase Auth (Client SDK en UI, Admin SDK en Server Actions).
- **Almacenamiento:**
  - _Producción:_ Google Drive API v3 (Service Account).
  - _Assets UI:_ Firebase Storage.
- **UI Library:** TailwindCSS + Shadcn/UI (Componentes Radix).
- **Gestión de Estado:** React Context + Server Actions (No Redux/Zustand innecesario).

## 3. Arquitectura de Directorios (Feature-First)

Evitar la agrupación por tipo de archivo. Agrupar por funcionalidad lógica para escalar.

```text
/src
  /app
    /(auth)          # Rutas de login/registro
    /(dashboard)     # Rutas privadas de la agencia (Layout con Sidebar)
    /(portal)        # Rutas públicas para clientes (Layout limpio)
    /api             # Webhooks (Meta/TikTok callbacks)
  /actions           # Next.js Server Actions (Backend Logic)
  /lib
    firebase.ts      # Cliente (Init para Auth)
    firebase-admin.ts# Servidor (Init para DB/Storage) - SOLO SERVER SIDE
    drive.ts         # Helper para Google Drive API
    ai
        prompts.ts   # System prompts optimizados para Gemini
  /components
    /ui              # Primitivos de Shadcn
    /domain          # Componentes específicos de negocio (ej: VideoCard)
  /types             # Definiciones de TypeScript (Zod schemas)

```

## 4. Esquema de Datos (Multi-Tenant Firestore)

**Modelo de Usuario:**

- Usuario (Freelancer/Agencia) -> Administra múltiples "Empresas" (Clientes).
- El Dashboard muestra los datos de la "Empresa Gestionada" seleccionada.

- **`users/{uid}`**
- Perfil del freelancer/agencia.
- Campos: `email`, `role`, `owned_agencies` (array de IDs).

- **`agencies/{agencyId}`** (Representa a la Empresa Gestionada/Cliente)
- Documento raíz de la organización/cliente.
- Campos: `name`, `drive_folder_id` (Folder compartido con la Service Account).

- **`agencies/{agencyId}/content/{contentId}`**
- La pieza de contenido.
- Campos: `status`, `script_content`, `video_drive_link`, `assigned_worker_uid`.

## 5. Integraciones Críticas (Reglas de Implementación)

1. **Google Drive:**
   - Cada Cliente/Empresa tiene su propio `drive_folder_id`.
   - Este folder puede estar en el Drive del Cliente (compartido con nuestra Service Account) o en el Drive de la Agencia.
   - La App escribe en ese folder usando la Service Account.
2. **IA (Gemini):**
   - Uso de System Prompts optimizados almacenados en `src/lib/ai/prompts.ts` para evitar que el usuario deba saber ingeniería de prompts.
3. **Next.js Server Actions:** NUNCA escribir en Firestore directamente desde el cliente (React components).
4. **Seguridad:** Middleware en `/src/middleware.ts` para proteger rutas `/dashboard`.

## 6. Roadmap de Ejecución (Paso a Paso)

### FASE 1: Cimientos (Infrastructure) [COMPLETADO]

### FASE 2: Gestión de Agencia (Core CRUD) [COMPLETADO]

_Nota: Se requerirá refactorizar el contexto de Auth para soportar selección de "Empresa Gestionada"._

### FASE 3: Motor de Contenidos (Workflow)

1. **Refactor de Contexto:** Permitir cambiar de Agencia/Cliente activo.
2. **Generación con IA:** Implementar llamada a Gemini con prompts optimizados.
3. **Vista de Calendario:** Gestión de fechas de publicación.
4. **Sistema de estados:** Idea -> Guion -> Grabación -> Revisión.

### FASE 4: Portal del Cliente (Public View)

1. Ruta dinámica `/portal/[token]`.
2. Interfaz simplificada de aprobación (Botones grandes: Aprobar/Rechazar).
