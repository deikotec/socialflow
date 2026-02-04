import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT_CONTENT_GENERATION } from "./prompts";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("Missing GOOGLE_API_KEY environment variable.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface GeneratedIdea {
  title: string;
  hook: string;
  body: string;
  cta: string;
  visual_cues: string;
}

export async function generateContentIdeas(topic: string): Promise<GeneratedIdea[]> {
  if (!apiKey) {
    throw new Error("AI is not configured (missing API Key).");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      ${SYSTEM_PROMPT_CONTENT_GENERATION}
      
      User Topic: "${topic}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting if the model disobeys
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const ideas: GeneratedIdea[] = JSON.parse(jsonString);
      return ideas;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", text);
      throw new Error("AI response was not valid JSON.");
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content ideas.");
  }
}
