# AI Content Strategy Generation — SocialFlow

Integra la generación de estrategia de contenido con IA (Gemini/Claude/ChatGPT) y crea una página completa de **Estrategia** en el sidebar, inspirada visualmente en los ficheros `c1.html`, `c2.html` y `s1.html`.

## Proposed Changes

---

### Types

#### [MODIFY] [index.ts](file:///d:/CODE/socialflow/src/types/index.ts)

- Añadir `FullStrategy` interface con: `pillars` (generados por IA), `contentIdeas`, `weeklyCalendar`, `kpis`, `roadmap`, `contentLibrary`, `instagramStoriesFunnel`.
- Añadir `aiStrategy?: FullStrategy` a `Company`.
- Añadir `aiProvider?: "gemini" | "claude" | "openai"` y `aiApiKey?: string` a `Company.settings`.

---

### AI Backend

#### [NEW] [strategy-prompt.ts](file:///d:/CODE/socialflow/src/lib/ai/strategy-prompt.ts)

Prompt experto que recibe el perfil de la empresa (sector, descripción, público, USP, tono, pilares definidos manualmente) y produce un JSON estructurado con: pilares de contenido, 15–20 ideas de contenido, calendario semanal tipo (7 días), KPIs meta, roadmap en 3 fases, biblioteca de contenido (5 piezas detalladas: carrusel, reels, linkedin), y plan de historias de Instagram.

#### [NEW] [strategy-actions.ts](file:///d:/CODE/socialflow/src/actions/strategy-actions.ts)

Server action `generateStrategyAction(companyId)`:

1. Lee la empresa de Firestore.
2. Detecta el proveedor (`gemini` | `claude` | `openai`) vía `company.settings.aiProvider`.
3. Llama a la IA con el prompt adecuado.
4. Parsea el JSON resultante a `FullStrategy`.
5. Guarda en Firestore `companies/{id}.aiStrategy`.
6. Retorna la estrategia.

#### [MODIFY] [gemini.ts](file:///d:/CODE/socialflow/src/lib/ai/gemini.ts)

Exportar función reutilizable `callGemini(prompt, apiKey?)` que acepta key personalizada.

---

### Settings — Estrategia Tab

#### [MODIFY] [strategy-form.tsx](file:///d:/CODE/socialflow/src/components/domain/settings/strategy-form.tsx)

- Añadir sección **"IA para Estrategia"** con:
  - Selector de proveedor (Gemini / Claude / ChatGPT).
  - Campo de API Key del proveedor (guardada en company settings).
  - Botón **"Generar Estrategia con IA"** → llama `generateStrategyAction`.
  - Estado de carga (`Generating...`) y toast de éxito.
  - Enlace a la página `/estrategia` al terminar.

---

### Página Estrategia (Nueva ruta en sidebar)

#### [MODIFY] [sidebar.tsx](file:///d:/CODE/socialflow/src/components/layout/sidebar.tsx)

Añadir entrada `{ name: "Estrategia", href: "/estrategia", icon: Lightbulb }` entre Embudo y Creación.

#### [NEW] [page.tsx](<file:///d:/CODE/socialflow/src/app/(dashboard)/estrategia/page.tsx>)

Server/client page que carga `currentCompany.aiStrategy` o muestra CTA para generar.

#### [NEW] [StrategyView.tsx](file:///d:/CODE/socialflow/src/components/domain/estrategia/StrategyView.tsx)

Componente rico con secciones inspiradas en los HTML de referencia:

| Sección                                                                                            | Inspiración                       |
| -------------------------------------------------------------------------------------------------- | --------------------------------- |
| Header + meta pills + company card                                                                 | `c2.html` `.header` + `.meta-bar` |
| Insight cards (contexto negocio)                                                                   | `c2.html` `.insights-strip`       |
| Pillar cards interactivos                                                                          | `c2.html` `.pillars-grid`         |
| Tabla ideas de contenido (20)                                                                      | `c2.html` `.ideas-table`          |
| Calendario semanal (7 columnas)                                                                    | `c2.html` `.cal-grid`             |
| KPI targets cards                                                                                  | `c2.html` `.kpi-grid`             |
| Roadmap 3 fases                                                                                    | `c2.html` `.phases`               |
| Biblioteca de contenido: tarjetas detalladas (carousel slides, reels scenes script, linkedin post) | `c1.html` `.content-card`         |
| Embudo de historias Instagram (3 fases funnel)                                                     | `s1.html` `.funnel-grid`          |

---

## User Review Required

> [!IMPORTANT]
> Las **API keys** de Claude/ChatGPT se guardan en Firestore bajo `company.settings.aiApiKey`. Si prefieres guardarlas solo en env vars, dímelo y ajustamos el enfoque.

> [!NOTE]
> El proyecto ya usa Gemini con `GOOGLE_API_KEY` en `.env.local`. Para Claude y OpenAI los usuarios ingresarán su propia key desde Settings.

---

## Verification Plan

### Automated

- `npm run build` — sin errores de tipos ni compilación.

### Manual

1. Abre `http://localhost:3000` con una empresa creada.
2. Ve a **Configuración > Estrategia**.
3. Selecciona proveedor "Gemini" (ya tiene key en .env.local).
4. Haz clic en **"Generar Estrategia con IA"** → espera toast de éxito.
5. En el sidebar, haz clic en **"Estrategia"** → verifica que se muestra la página completa con todas las secciones.
6. Verifica que cada sección tiene datos generados por la IA (pilares, ideas, calendario, KPIs, contenido, funnel).
