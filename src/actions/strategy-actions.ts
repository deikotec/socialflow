"use server";

import { adminDb } from "@/lib/firebase-admin";
import { buildStrategyPrompt } from "@/lib/ai/strategy-prompt";
import { FullStrategy, ContentIdea, ContentLibraryItem } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Provider helpers ────────────────────────────────────────────────────────

async function callGemini(prompt: string, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("Gemini API key not configured.");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("Claude API key is required.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("OpenAI API key is required.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8192,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Helpers ─────────────────────────────────────────────────────────────────
import * as cheerio from "cheerio"; // We need to add this dependency later

async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn(`[Scraper] Failed to fetch ${url}: ${res.statusText}`);
      return url; // Fallback to just returning the URL
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles and other unnecessary tags
    $('script, style, noscript, iframe, img, svg').remove();
    
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();

    return text.substring(0, 5000); // 5k chars max to save context window
  } catch (error) {
    console.warn(`[Scraper] Exception fetching ${url}:`, error);
    return url;
  }
}

// ── Main Server Action ──────────────────────────────────────────────────────

export async function generateStrategyAction(
  companyId: string
): Promise<{ success: boolean; strategy?: FullStrategy; error?: string }> {
  try {
    // 1. Load company from Firestore
    const companyDoc = await adminDb.collection("companies").doc(companyId).get();
    if (!companyDoc.exists) {
      return { success: false, error: "Company not found." };
    }
    const company = companyDoc.data()!;

    // 2. Fetch external context
    let websiteContext = company.settings?.website || "";
    if (
      company.settings?.website &&
      company.settings.website.startsWith("http")
    ) {
      console.log(`[Strategy] Scraping website context from ${company.settings.website}...`);
      const scraped = await scrapeWebsiteContent(company.settings.website);
      websiteContext = `URL: ${company.settings.website}\n\nResumen de contenido web:\n${scraped}`;
    }

    // 3. Build prompt
    const prompt = buildStrategyPrompt({
      name: company.name,
      sector: company.sector,
      description: company.description,
      targetAudience: company.targetAudience,
      usp: company.usp,
      tone: company.tone,
      website: websiteContext,
      instagram: company.settings?.instagram,
      products: company.products,
      targetNetworks: company.settings?.targetNetworks,
      contentResources: company.settings?.contentResources,
      contentPlan: company.settings?.contentPlan,
    });

    // 3. Call AI provider
    const aiProvider: "gemini" | "claude" | "openai" =
      company.settings?.aiProvider || "gemini";
    const aiApiKey: string | undefined = company.settings?.aiApiKey;

    let rawText: string;

    switch (aiProvider) {
      case "claude":
        rawText = await callClaude(prompt, aiApiKey || "");
        break;
      case "openai":
        rawText = await callOpenAI(prompt, aiApiKey || "");
        break;
      case "gemini":
      default:
        rawText = await callGemini(prompt, aiApiKey);
        break;
    }

    // 4. Parse JSON
    const cleanJson = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let strategy: FullStrategy;
    try {
      strategy = JSON.parse(cleanJson);
    } catch {
      console.error("[Strategy] Failed to parse AI response:", rawText.slice(0, 500));
      throw new Error("La IA no devolvió un JSON válido. Inténtalo de nuevo.");
    }

    // Ensure generatedAt is set
    strategy.generatedAt = new Date().toISOString();

    // 5. Save to Firestore
    await adminDb.collection("companies").doc(companyId).update({
      aiStrategy: strategy,
    });

    console.log(`[Strategy] Generated and saved for company ${companyId}`);
    return { success: true, strategy };
  } catch (e: unknown) {
    const error = e as Error;
    console.error("[Strategy] Error:", error);
    return { success: false, error: error.message || "Error desconocido." };
  }
}

import { buildSingleIdeaPrompt, buildMonthlyContentPrompt } from "@/lib/ai/strategy-prompt";

export async function regenerateSingleIdeaAction(
  companyId: string,
  ideaIndex: number
): Promise<{ success: boolean; strategy?: FullStrategy; error?: string }> {
  try {
    const companyDoc = await adminDb.collection("companies").doc(companyId).get();
    if (!companyDoc.exists) {
      return { success: false, error: "Company not found." };
    }
    const company = companyDoc.data()!;
    if (!company.aiStrategy) {
      return { success: false, error: "Strategy not generated yet." };
    }

    const strategy = company.aiStrategy as FullStrategy;
    const oldLibraryItem = strategy.contentLibrary[ideaIndex];
    const oldContentIdea = strategy.contentIdeas[ideaIndex];

    if (!oldLibraryItem || !oldContentIdea) {
      return { success: false, error: "Idea not found at that index." };
    }

    // Build prompt
    const prompt = buildSingleIdeaPrompt({
      name: company.name,
      sector: company.sector,
      description: company.description,
      targetAudience: company.targetAudience,
      usp: company.usp,
      tone: company.tone,
      website: company.settings?.website,
      instagram: company.settings?.instagram,
      products: company.products,
      targetNetworks: company.settings?.targetNetworks,
      contentResources: company.settings?.contentResources,
      contentPlan: company.settings?.contentPlan,
    }, {
      title: oldLibraryItem.title,
      pillar: oldLibraryItem.pillar,
      format: oldContentIdea.format,
      channel: oldContentIdea.channel
    });

    const aiProvider: "gemini" | "claude" | "openai" = company.settings?.aiProvider || "gemini";
    const aiApiKey: string | undefined = company.settings?.aiApiKey;

    let rawText: string;
    switch (aiProvider) {
      case "claude": rawText = await callClaude(prompt, aiApiKey || ""); break;
      case "openai": rawText = await callOpenAI(prompt, aiApiKey || ""); break;
      case "gemini":
      default: rawText = await callGemini(prompt, aiApiKey); break;
    }

    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let newContent: { idea: ContentIdea, contentLibrary: ContentLibraryItem };
    try {
      newContent = JSON.parse(cleanJson);
    } catch {
      console.error("[Strategy] Failed to parse AI single idea response:", rawText.slice(0, 500));
      throw new Error("La IA no devolvió un JSON válido para la idea. Inténtalo de nuevo.");
    }

    // Replace the specific elements
    strategy.contentIdeas[ideaIndex] = newContent.idea;
    strategy.contentLibrary[ideaIndex] = newContent.contentLibrary;

    // Save to Firestore
    await adminDb.collection("companies").doc(companyId).update({ aiStrategy: strategy });

    console.log(`[Strategy] Single Idea regenerated for company ${companyId}, index ${ideaIndex}`);
    return { success: true, strategy };
  } catch (e: unknown) {
    const error = e as Error;
    console.error(`[Strategy] Error regenerating idea ${ideaIndex}:`, error);
    return { success: false, error: error.message || "Error desconocido." };
  }
}

export async function toggleIdeaUsedAction(
  companyId: string,
  ideaIndex: number,
  isUsed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyDoc = await adminDb.collection("companies").doc(companyId).get();
    if (!companyDoc.exists) return { success: false, error: "Company not found." };
    const company = companyDoc.data()!;
    if (!company.aiStrategy) return { success: false, error: "Strategy not generated yet." };

    const strategy = company.aiStrategy as FullStrategy;
    if (strategy.contentLibrary[ideaIndex]) {
      strategy.contentLibrary[ideaIndex].isUsed = isUsed;
      await adminDb.collection("companies").doc(companyId).update({ aiStrategy: strategy });
      return { success: true };
    }
    return { success: false, error: "Idea not found." };
  } catch (e: unknown) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
}

export async function regenerateMonthlyContentAction(
  companyId: string
): Promise<{ success: boolean; strategy?: FullStrategy; error?: string }> {
  try {
    const companyDoc = await adminDb.collection("companies").doc(companyId).get();
    if (!companyDoc.exists) return { success: false, error: "Company not found." };
    
    const company = companyDoc.data()!;
    if (!company.aiStrategy) return { success: false, error: "Strategy not generated yet." };
    
    const strategy = company.aiStrategy as FullStrategy;
    
    // Setup past ideas
    const pastIdeas = strategy.pastUsedIdeas || [];
    // Add any newly used ideas to the history
    strategy.contentLibrary.forEach(item => {
      if (item.isUsed && !pastIdeas.includes(item.title)) {
        pastIdeas.push(item.title);
      }
    });

    const prompt = buildMonthlyContentPrompt({
      name: company.name,
      sector: company.sector,
      description: company.description,
      targetAudience: company.targetAudience,
      usp: company.usp,
      tone: company.tone,
      website: company.settings?.website,
      targetNetworks: company.settings?.targetNetworks,
      contentResources: company.settings?.contentResources,
      contentPlan: company.settings?.contentPlan,
      manychatAutomations: company.settings?.manychatAutomations,
    }, {
      summary: strategy.summary,
      targetChannels: strategy.targetChannels,
      pillars: strategy.pillars.map(p => ({ name: p.name, desc: p.desc }))
    }, pastIdeas);

    const aiProvider: "gemini" | "claude" | "openai" = company.settings?.aiProvider || "gemini";
    const aiApiKey: string | undefined = company.settings?.aiApiKey;

    let rawText: string;
    switch (aiProvider) {
      case "claude": rawText = await callClaude(prompt, aiApiKey || ""); break;
      case "openai": rawText = await callOpenAI(prompt, aiApiKey || ""); break;
      case "gemini":
      default: rawText = await callGemini(prompt, aiApiKey); break;
    }

    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let newMonthlyContent: Partial<FullStrategy>;
    try {
      newMonthlyContent = JSON.parse(cleanJson);
    } catch {
      console.error("[Strategy] Failed to parse AI monthly response:", rawText.slice(0, 500));
      throw new Error("La IA no devolvió un JSON válido para el mes. Inténtalo de nuevo.");
    }

    // Merge new content into existing strategy
    strategy.contentIdeas = newMonthlyContent.contentIdeas || [];
    strategy.weeklyCalendar = newMonthlyContent.weeklyCalendar || [];
    strategy.contentLibrary = newMonthlyContent.contentLibrary || [];
    strategy.pastUsedIdeas = pastIdeas;

    await adminDb.collection("companies").doc(companyId).update({ aiStrategy: strategy });

    console.log(`[Strategy] Monthly content regenerated for company ${companyId}`);
    return { success: true, strategy };
  } catch (e: unknown) {
    const error = e as Error;
    console.error(`[Strategy] Error regenerating monthly content:`, error);
    return { success: false, error: error.message || "Error desconocido." };
  }
}
