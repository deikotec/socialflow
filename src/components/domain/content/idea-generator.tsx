"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateIdeasAction, createContent } from "@/actions/content-actions"; // Helper to save idea
import { useAuth } from "@/components/providers/auth-provider";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { GeneratedIdea } from "@/lib/ai/gemini";

export function IdeaGenerator({
  onIdeaCreated,
}: {
  onIdeaCreated?: () => void;
}) {
  const { currentCompany } = useAuth();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);

  const handleGenerate = async () => {
    if (!topic || !currentCompany) return;
    setIsGenerating(true);
    try {
      const result = await generateIdeasAction(topic);
      setIdeas(result);
    } catch (error) {
      console.error("Failed to generate ideas", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveIdea = async (idea: GeneratedIdea) => {
    if (!currentCompany) return;
    try {
      await createContent(currentCompany.id, {
        title: idea.title,
        topic: topic,
        script: `**Hook:** ${idea.hook}\n\n**Body:** ${idea.body}\n\n**CTA:** ${idea.cta}\n\n**Visuals:** ${idea.visual_cues}`,
        status: "idea",
        platform: "instagram", // Default
      });
      if (onIdeaCreated) onIdeaCreated();
      // Optionally remove from list or show success toast
    } catch (error) {
      console.error("Error saving idea", error);
    }
  };

  if (!currentCompany) return null;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter a topic (e.g. 'Real Estate Tips for Buyers')"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button onClick={handleGenerate} disabled={isGenerating || !topic}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ideas.map((idea, idx) => (
          <Card key={idx} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{idea.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 text-sm space-y-2">
              <p>
                <strong>Hook:</strong> {idea.hook}
              </p>
              <p className="line-clamp-3">{idea.body}</p>
              <p className="text-muted-foreground text-xs italic">
                Visuals: {idea.visual_cues}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => handleSaveIdea(idea)}
              >
                <Plus className="mr-2 h-4 w-4" /> Save as Draft
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
