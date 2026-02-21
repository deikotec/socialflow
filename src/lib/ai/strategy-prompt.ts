export function buildStrategyPrompt(company: {
  name: string;
  sector?: string;
  description?: string;
  targetAudience?: string;
  usp?: string;
  tone?: string;
  website?: string;
  instagram?: string;
  products?: { name: string; description: string; type: string }[];
  targetNetworks?: string[];
  contentResources?: string;
  contentPlan?: string;
  manychatAutomations?: string;
}): string {
  const productsInfo = company.products?.length
    ? company.products
        .map((p) => `- ${p.name} (${p.type}): ${p.description}`)
        .join("\n")
    : "No especificados";

  const targetNetworksString = company.targetNetworks?.length ? company.targetNetworks.join(", ") : "Instagram, TikTok y LinkedIn";
  const manychatInst = company.manychatAutomations 
    ? `- Automatización Manychat configurada: "${company.manychatAutomations}". ASEGÚRATE de incluir Call to Actions (CTAs) específicos animando a comentar ciertas palabras clave para activar las respuestas automáticas de Manychat en la mayoría de los captions y guiones.` 
    : "";

  return `
Eres un experto en marketing de contenidos y estrategia de redes sociales. 
Tu tarea es generar una estrategia de contenido completa y personalizada para la siguiente empresa.

## DATOS DE LA EMPRESA
- Nombre: ${company.name}
- Sector: ${company.sector || "No especificado"}
- Descripción: ${company.description || "No especificada"}
- Público objetivo: ${company.targetAudience || "No especificado"}
- Propuesta única de valor (USP): ${company.usp || "No especificada"}
- Tono de voz: ${company.tone || "Profesional y cercano"}
- Sitio Web: ${company.website || "No especificado"}
- Cuenta de Instagram: ${company.instagram || "No especificada"}
- Redes sociales objetivo: ${targetNetworksString}
- Recursos para grabación de contenido (modelos, empleados, UGC, etc.): ${company.contentResources || "No especificado"}
- Plan o límite de contenido contratado/semanal: ${company.contentPlan || "Depende de lo que consideres óptimo"}
- Productos/Servicios:
${productsInfo}

## INSTRUCCIONES
Genera una estrategia de contenido completa adaptada a esta empresa. La estrategia debe ser:
- Altamente específica para el sector y empresa (usa su nombre, sector, productos y USP real)
- Utiliza la información del sitio web e instagram de la empresa para contextualizar mucho mejor el contenido, si están disponibles.
- Debes DEFINIR tú mismo los Pilares de Contenido más eficaces para esta empresa basándote en su contexto y sus productos. Sugiere 3 a 5 pilares con sus porcentajes (que deben sumar 100%).
- Debes DEFINIR tú mismo la Frecuencia Semanal de publicación óptima para esta empresa según su mercado y situación actual.
- Accionable y con ejemplos concretos de títulos e ideas de contenido
- Orientada a ${targetNetworksString} principalmente
- Basada en copywriting persuasivo y engagement máximo
- TOMA EN CUENTA los "Recursos para grabación" al proponer ideas (ej. si no hay modelos, sugiere contenido sin personas o voz en off. Si hay empleados, inclúyelos).
- TOMA EN CUENTA el "Plan o límite de contenido" al armar el calendario semanal. Crea una frecuencia realista ajustada a esa limitación indicada.
${manychatInst}

## FORMATO DE SALIDA
Retorna ÚNICAMENTE un JSON válido (sin markdown code blocks, sin texto adicional) con esta estructura exacta:

{
  "generatedAt": "<fecha ISO>",
  "summary": "<resumen ejecutivo de la estrategia en 2-3 frases>",
  "targetChannels": ["instagram", "tiktok", "linkedin"],
  "insights": [
    { "icon": "🏢", "label": "Sector", "value": "<valor>", "sub": "<subtitulo>" },
    { "icon": "🎯", "label": "Público", "value": "<valor corto>", "sub": "<descripción>" },
    { "icon": "⚡", "label": "USP", "value": "<valor corto>", "sub": "<descripción>" },
    { "icon": "📅", "label": "Frecuencia", "value": "<N posts/sem>", "sub": "<descripción>" },
    { "icon": "🏆", "label": "Meta", "value": "<objetivo>", "sub": "<KPI>" }
  ],
  "pillars": [
    {
      "icon": "⚡",
      "name": "<nombre del pilar>",
      "desc": "<descripción del pilar>",
      "percentage": 35,
      "examples": ["<ejemplo 1>", "<ejemplo 2>", "<ejemplo 3>"],
      "color": "#f5a623"
    }
  ],
  "contentIdeas": [
    {
      "idea": "<título de la idea de contenido>",
      "channel": "instagram",
      "format": "carousel",
      "pillar": "<nombre del pilar>"
    }
  ],
  "weeklyCalendar": [
    {
      "day": "Lunes",
      "posts": [
        {
          "time": "08:00",
          "channel": "instagram",
          "type": "carousel",
          "title": "<título del post>"
        }
      ]
    }
  ],
  "kpis": [
    { "icon": "❤️", "label": "Tasa de Engagement", "value": "2-4%", "target": "Primeros 3 meses" },
    { "icon": "👁️", "label": "Alcance Orgánico", "value": "500-2k", "target": "Por publicación" },
    { "icon": "🔖", "label": "Guardados", "value": "5-10%", "target": "En carruseles" },
    { "icon": "↗️", "label": "Compartidos", "value": "2-5%", "target": "Reels virales" }
  ],
  "roadmap": [
    {
      "phase": "FASE 1",
      "title": "Cimientos",
      "period": "Mes 1-2",
      "items": ["<acción 1>", "<acción 2>", "<acción 3>"],
      "color": "#4A90E2"
    },
    {
      "phase": "FASE 2",
      "title": "Crecimiento",
      "period": "Mes 3-4",
      "items": ["<acción 1>", "<acción 2>", "<acción 3>"],
      "color": "#f5a623"
    },
    {
      "phase": "FASE 3",
      "title": "Monetización",
      "period": "Mes 5-6",
      "items": ["<acción 1>", "<acción 2>", "<acción 3>"],
      "color": "#2ECC71"
    }
  ],
  "contentLibrary": [
    {
      "id": "lib-001",
      "title": "<título del contenido>",
      "type": "carousel",
      "channels": ["instagram"],
      "pillar": "<pilar>",
      "strategyNote": "<nota estratégica de por qué este contenido funciona>",
      "engTargets": [
        { "icon": "❤️", "label": "Like", "desc": "<por qué genera likes>" },
        { "icon": "🔖", "label": "Guardado", "desc": "<por qué genera guardados>" },
        { "icon": "💬", "label": "Comentario", "desc": "<por qué genera comentarios>" }
      ],
      "slides": [
        { "num": "PORTADA", "role": "Hook", "text": "<texto de portada>", "subtext": "<subtexto>", "cta": null, "bg": "bg-dark-text" },
        { "num": "SLIDE 2", "role": "El problema", "text": "<texto>", "subtext": null, "cta": null, "bg": "bg-white-clean" },
        { "num": "SLIDE 3", "role": "La solución", "text": "<texto>", "subtext": "<subtexto>", "cta": null, "bg": "bg-sun-warm" },
        { "num": "SLIDE 4 (CTA)", "role": "Llamada a la acción", "text": "<pregunta o CTA>", "subtext": "<instrucción>", "cta": "<CTA>", "bg": "bg-sky-deep" }
      ],
      "caption": "<caption completo para Instagram con emojis>",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5"
    },
    {
      "id": "lib-002",
      "title": "<título del reel>",
      "type": "reel",
      "channels": ["instagram", "tiktok"],
      "pillar": "<pilar>",
      "strategyNote": "<nota estratégica>",
      "engTargets": [
        { "icon": "❤️", "label": "Like", "desc": "<por qué>" },
        { "icon": "↗️", "label": "Compartido", "desc": "<por qué>" }
      ],
      "duration": "30-45 segundos",
      "ratio": "9:16 vertical",
      "music": "Trending en TikTok (instrumental energético)",
      "scenes": [
        { "sceneNum": 1, "timeRange": "0–3s",  "phase": "HOOK",     "what": "<qué se ve>", "how": "<cómo grabarlo>", "textOverlay": "TEXTO EN PANTALLA: \"<texto>\"" },
        { "sceneNum": 2, "timeRange": "3–15s", "phase": "DESARROLLO","what": "<qué se ve>", "how": "<cómo grabarlo>", "textOverlay": "TEXTO: \"<texto>\"" },
        { "sceneNum": 3, "timeRange": "15–30s","phase": "CLÍMAX",   "what": "<qué se ve>", "how": "<cómo grabarlo>", "textOverlay": "TEXTO: \"<texto>\"" },
        { "sceneNum": 4, "timeRange": "30–45s","phase": "CTA",      "what": "<qué se ve>", "how": "<cómo grabarlo>", "textOverlay": "TEXTO: \"<CTA>\"" }
      ],
      "script": {
        "hook": "<primera frase de gancho>",
        "body": "<desarrollo del contenido>",
        "cta": "<llamada a la acción>>"
      },
      "caption": "<caption para Instagram/TikTok>",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3"
    },
    {
      "id": "lib-003",
      "title": "<título del post de LinkedIn>",
      "type": "linkedin",
      "channels": ["linkedin"],
      "pillar": "<pilar>",
      "strategyNote": "<nota estratégica>",
      "engTargets": [
        { "icon": "❤️", "label": "Like", "desc": "<por qué>" },
        { "icon": "💬", "label": "Comentario", "desc": "<por qué>" }
      ],
      "linkedinPost": "<texto completo del post de LinkedIn con saltos de línea\\n\\nIncluye hook fuerte, desarrollo, datos y CTA al final>",
      "linkedinHashtags": "#hashtag1 #hashtag2 #hashtag3",
      "caption": "<resumen del post>",
      "hashtags": "#hashtag1 #hashtag2"
    }
  ],
  "storiesFunnel": [
    {
      "phase": "FASE 1",
      "title": "Conciencia",
      "objective": "AWARENESS",
      "description": "<qué tipo de historias publicar en esta fase>",
      "days": ["Lunes", "Miércoles"],
      "color": "#4A90E2"
    },
    {
      "phase": "FASE 2",
      "title": "Consideración",
      "objective": "ENGAGEMENT",
      "description": "<qué tipo de historias publicar en esta fase>",
      "days": ["Martes", "Jueves"],
      "color": "#f5a623"
    },
    {
      "phase": "FASE 3",
      "title": "Conversión",
      "objective": "CONVERSIÓN",
      "description": "<qué tipo de historias publicar en esta fase>",
      "days": ["Viernes", "Sábado"],
      "color": "#2ECC71"
    }
  ]
}

INSTRUCCIONES CRÍTICAS:
1. Adapta TODO el contenido a la empresa específica: usa su nombre, sector, casos de uso reales.
2. Lee el "Plan o límite de contenido" y determina la cantidad de publicaciones AL MES (ej. 3 a la semana = 12 al mes). Genera EXACTAMENTE esa cantidad de ideas en contentIdeas.
3. Genera el calendario completo asegurando que el número de posts en la semana coincida con el límite semanal indicado en el plan.
4. Genera en contentLibrary el desarrollo de guiones/copies DETALLADO para TODAS Y CADA UNA de las ideas creadas. Si hiciste 12 ideas en contentIdeas, deben haber EXACTAMENTE 12 ítems completos en contentLibrary.
5. Retorna SOLO el JSON, sin texto antes ni después, sin bloques de código markdown.
`;
}

export function buildSingleIdeaPrompt(
  company: {
    name: string;
    sector?: string;
    description?: string;
    targetAudience?: string;
    usp?: string;
    tone?: string;
    website?: string;
    instagram?: string;
    products?: { name: string; description: string; type: string }[];
    targetNetworks?: string[];
    contentResources?: string;
    contentPlan?: string;
    manychatAutomations?: string;
  },
  oldIdea: {
    title: string;
    pillar: string;
    format: string;
    channel: string;
  }
): string {
  const productsInfo = company.products?.length
    ? company.products
        .map((p) => `- ${p.name} (${p.type}): ${p.description}`)
        .join("\n")
    : "No especificados";

  const targetNetworksString = company.targetNetworks?.length ? company.targetNetworks.join(", ") : "Instagram, TikTok y LinkedIn";
  const manychatInst = company.manychatAutomations 
    ? `- Automatización Manychat configurada: "${company.manychatAutomations}". ASEGÚRATE de incluir Call to Actions (CTAs) específicos animando a comentar ciertas palabras clave para activar las respuestas automáticas de Manychat en la mayoría de los captions y guiones.` 
    : "";

  return `
Eres un experto en marketing de contenidos. Tu tarea es generar UNA nueva idea de contenido y su desarrollo detallado para reemplazar una idea que el cliente descartó.

## DATOS DE LA EMPRESA
- Nombre: ${company.name}
- Sector: ${company.sector || "No especificado"}
- Descripción: ${company.description || "No especificada"}
- Público objetivo: ${company.targetAudience || "No especificado"}
- Propuesta única de valor (USP): ${company.usp || "No especificada"}
- Tono de voz: ${company.tone || "Profesional y cercano"}
- Sitio Web: ${company.website || "No especificado"}
- Redes sociales objetivo: ${targetNetworksString}
- Recursos para grabación: ${company.contentResources || "No especificado"}
- Productos/Servicios:
${productsInfo}

## INSTRUCCIONES
Debes reemplazar la siguiente idea descartada:
- Título/Idea anterior: "${oldIdea.title}"
- Pilar estratégico: "${oldIdea.pillar}"
- Canal: "${oldIdea.channel}"
- Formato: "${oldIdea.format}"

1. Genera una NUEVA idea, completamente diferente a la anterior, pero que pertenezca al mismo pilar estratégico y tenga el mismo canal y formato.
2. Toma en cuenta el perfil de la empresa y los recursos de grabación.
3. Genera el desarrollo completo para la biblioteca de contenido (contentLibrary).
${manychatInst}

## FORMATO DE SALIDA
Retorna ÚNICAMENTE un objeto JSON válido (sin markdown code blocks, sin texto adicional), con esta estructura exacta según el formato indicado (${oldIdea.format}):

{
  "idea": {
    "idea": "<nuevo título de la idea>",
    "channel": "${oldIdea.channel}",
    "format": "${oldIdea.format}",
    "pillar": "${oldIdea.pillar}"
  },
  "contentLibrary": {
    "id": "<genera un ID único tipo lib-xxx>",
    "title": "<el mismo nuevo título>",
    "type": "${oldIdea.format === 'linkedin_post' ? 'linkedin' : oldIdea.format}",
    "channels": ["${oldIdea.channel}"],
    "pillar": "${oldIdea.pillar}",
    "strategyNote": "<nota estratégica de por qué este formato funciona mejor>",
    "engTargets": [
      { "icon": "❤️", "label": "Like", "desc": "<por qué>" }
    ],
    "slides": [
      { "num": "PORTADA", "role": "Hook", "text": "<texto>", "subtext": "<subtexto>", "cta": null, "bg": "bg-dark-text" }
    ],
    "duration": "30-45 segundos",
    "ratio": "9:16 vertical",
    "music": "Audio en tendencia",
    "scenes": [
      { "sceneNum": 1, "timeRange": "0–3s", "phase": "HOOK", "what": "<qué se ve>", "how": "<cómo grabarlo>", "textOverlay": "TEXTO: \\"<texto>\\"" }
    ],
    "script": {
      "hook": "<gancho>",
      "body": "<cuerpo>",
      "cta": "<llamada a la acción>"
    },
    "linkedinPost": "<texto completo del post>",
    "linkedinHashtags": "#hashtags",
    "caption": "<caption completo>",
    "hashtags": "#hashtags"
  }
}
`;
}

export function buildMonthlyContentPrompt(
  company: {
    name: string;
    sector?: string;
    description?: string;
    targetAudience?: string;
    usp?: string;
    tone?: string;
    website?: string;
    targetNetworks?: string[];
    contentResources?: string;
    contentPlan?: string;
    manychatAutomations?: string;
  },
  strategyContext: {
    summary: string;
    targetChannels: string[];
    pillars: { name: string; desc: string }[];
  },
  pastUsedIdeas: string[]
): string {

  const targetNetworksString = company.targetNetworks?.length ? company.targetNetworks.join(", ") : "Instagram, TikTok y LinkedIn";
  const manychatInst = company.manychatAutomations 
    ? `- Automatización Manychat configurada: "${company.manychatAutomations}". ASEGÚRATE de incluir Call to Actions (CTAs) específicos animando a comentar ciertas palabras clave para activar las respuestas automáticas de Manychat en la mayoría de los captions y guiones.` 
    : "";

  const pastIdeasInstruction = pastUsedIdeas.length > 0 
    ? `\n## IDEAS YA PUBLICADAS (NO REPETIR)\nEl cliente ya ha publicado o utilizado las siguientes ideas anteriormente. Debes generar contenido TOTALMENTE NUEVO y original que no compita ni se parezca a:\n${pastUsedIdeas.map(i => `- ${i}`).join("\n")}`
    : "";

  return `
Eres un experto en marketing de contenidos. Tu tarea es generar UN NUEVO LOTE DE IDEAS DE CONTENIDO MENSUALES para una empresa, manteniendo la estrategia base ya definida (mismos pilares).

## DATOS DE LA EMPRESA
- Nombre: ${company.name}
- Sector: ${company.sector || "No especificado"}
- Descripción: ${company.description || "No especificada"}
- Público objetivo: ${company.targetAudience || "No especificado"}
- Propuesta única de valor (USP): ${company.usp || "No especificada"}
- Tono de voz: ${company.tone || "Profesional y cercano"}
- Sitio Web: ${company.website || "No especificado"}
- Redes sociales objetivo: ${targetNetworksString}
- Recursos para grabación: ${company.contentResources || "No especificado"}
${pastIdeasInstruction}

## CONTEXTO DE LA ESTRATEGIA (MANTENER)
- Resumen Estratégico actual: ${strategyContext.summary}
- Pilares de contenido a utilizar: ${strategyContext.pillars.map(p => p.name).join(", ")}

## INSTRUCCIONES CRÍTICAS
1. Adapta el contenido a la empresa: usa su nombre, sector y sus detalles.
2. Lee el "Plan o límite de contenido": ${company.contentPlan || "Depende de tu criterio"}. En base a esto, determina la cantidad exacta de publicaciones AL MES (ej. 3 por semana = 12 al mes).
3. Genera EXACTAMENTE esa cantidad de IDEAS NUEVAS en \`contentIdeas\`, completamente diferentes a las "Ideas Ya Publicadas".
4. Construye el \`weeklyCalendar\` (calendario semanal tipo) para distribuir adecuadamente esta frecuencia en la semana.
5. Genera en \`contentLibrary\` el desarrollo DETALLADO (slides, guiones, textos) para TODAS Y CADA UNA de las nuevas ideas en \`contentIdeas\`.
${manychatInst}

## FORMATO DE SALIDA
Retorna ÚNICAMENTE un objeto JSON válido (sin markdown code blocks, sin texto adicional) con esta estructura EXACTA:

{
  "contentIdeas": [
    {
      "idea": "<título de la idea>",
      "channel": "instagram",
      "format": "carousel",
      "pillar": "<nombre del pilar (elige uno de la estrategia)>"
    }
  ],
  "weeklyCalendar": [
    {
      "day": "Lunes",
      "posts": [
        {
          "time": "08:00",
          "channel": "instagram",
          "type": "carousel",
          "title": "<título adaptado>"
        }
      ]
    }
  ],
  "contentLibrary": [
    {
      "id": "<id único ej lib-m2-001>",
      "title": "<el mismo título de contentIdeas>",
      "type": "carousel",
      "channels": ["instagram"],
      "pillar": "<pilar>",
      "strategyNote": "<por qué funciona>",
      "engTargets": [ { "icon": "❤️", "label": "Like", "desc": "motivo" } ],
      "slides": [ { "num": "PORTADA", "role": "Hook", "text": "Texto", "subtext": "", "cta": null, "bg": "bg-dark-text" } ],
      "duration": "30-45 segundos",
      "ratio": "9:16 vertical",
      "music": "Audio en tendencia",
      "scenes": [ { "sceneNum": 1, "timeRange": "0-3s", "phase": "HOOK", "what": "Ver", "how": "Hacer", "textOverlay": "TEXTO: \\"Hey\\"" } ],
      "script": { "hook": "...", "body": "...", "cta": "..." },
      "linkedinPost": "...",
      "linkedinHashtags": "#hash",
      "caption": "...",
      "hashtags": "#hash"
    }
  ]
}
`;
}
