# Guía de Usuario: Flujo de Trabajo en SocialFlow

Esta guía describe los pasos que sigue un nuevo usuario para utilizar la plataforma, desde el registro hasta la aprobación de contenido por parte del cliente.

## 1. Registro e Inicio de Sesión

- El usuario (dueño de agencia o freelancer) se registra en la aplicación.
- Al iniciar sesión, accede al **Dashboard Principal**.

## 2. Creación de una Empresa (Cliente)

- **Acción:** Navegar a la sección **Clients** (`/clients`).
- **Paso:** Hacer clic en el botón **"Add Client"**.
- **Proceso:**
  - Ingresar el nombre de la empresa (ej. "Acme Corp").
  - El sistema crea automáticamente:
    - Un registro en la base de datos vinculado al usuario.
    - Una **Carpeta en Google Drive** dedicada para esa empresa.
    - Un **Portal Token** único para compartir con el cliente.

## 3. Generación de Contenido

- **Acción:** Seleccionar la empresa recién creada en el selector de contexto (arriba a la derecha o en la lista).
- **Navegación:** Ir a la sección **Content** (`/content`).
- **Generación con IA:**
  - Usar el **Idea Generator**: Ingresar un tema (ej. "Consejos de Compra de Vivienda").
  - La IA (Gemini) genera ideas estructuradas (Gancho, Cuerpo, Llamada a la Acción, Visuales).
  - Guardar las mejores ideas. Estas quedan en estado `idea`.
- **Gestión:**
  - Las ideas guardadas aparecen en el tablero.
  - Se pueden mover a estado `review` cuando el guion esté listo para aprobación.

## 4. Aprobación del Cliente (Portal Público)

- **Acción:** El usuario comparte el **Enlace del Portal** con su cliente.
  - Formato: `https://app.socialflow.com/portal/[TOKEN_DE_EMPRESA]`
- **Vista del Cliente:**
  - El cliente accede al enlace (no requiere login).
  - Ve una lista de contenido pendiente de revisión (estado `review`).
- **Feedback:**
  - **Aprobar:** El contenido pasa a estado `approved`.
  - **Rechazar:** El cliente debe dejar un comentario explicando la razón. El contenido pasa a `rejected`.

## 5. Finalización

- El usuario ve en su Dashboard el estado actualizado del contenido (`approved` o `rejected` con feedback).
- El contenido aprobado puede proceder a la etapa de producción/programación.
