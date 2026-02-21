"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompany } from "@/actions/company-actions";
import { generateStrategyAction } from "@/actions/strategy-actions";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, ExternalLink, KeyRound, Bot } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Separator } from "@/components/ui/separator";

interface StrategyFormProps {
  company: Company;
}

export function StrategyForm({ company }: StrategyFormProps) {
  const { refreshCompanies } = useAuth();
  const router = useRouter();

  // AI provider settings
  const [aiProvider, setAiProvider] = useState<"gemini" | "claude" | "openai">(
    company.settings?.aiProvider || "gemini",
  );
  const [aiApiKey, setAiApiKey] = useState<string>(
    company.settings?.aiApiKey || "",
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Extended Company Fields for AI Context
  const [sector, setSector] = useState(company.sector || "");
  const [description, setDescription] = useState(company.description || "");
  const [targetAudience, setTargetAudience] = useState(
    company.targetAudience || "",
  );
  const [usp, setUsp] = useState(company.usp || "");
  const [tone, setTone] = useState(company.tone || "");

  // New Strategy Constraints
  const [targetNetworks, setTargetNetworks] = useState<string[]>(
    company.settings?.targetNetworks || ["instagram", "tiktok", "linkedin"],
  );
  const [contentResources, setContentResources] = useState(
    company.settings?.contentResources || "",
  );
  const [contentPlan, setContentPlan] = useState(
    company.settings?.contentPlan || "",
  );
  const [manychatAutomations, setManychatAutomations] = useState(
    company.settings?.manychatAutomations || "",
  );

  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateCompany(company.id, {
        sector,
        description,
        targetAudience,
        usp,
        tone,
        settings: {
          ...company.settings,
          aiProvider,
          aiApiKey: aiApiKey || undefined,
          targetNetworks,
          contentResources,
          contentPlan,
          manychatAutomations,
        },
      });
      await refreshCompanies();
      toast({ title: "Cambios guardados." });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateStrategy = async () => {
    // Save AI settings first
    try {
      await updateCompany(company.id, {
        sector,
        description,
        targetAudience,
        usp,
        tone,
        settings: {
          ...company.settings,
          aiProvider,
          aiApiKey: aiApiKey || undefined,
          targetNetworks,
          contentResources,
          contentPlan,
          manychatAutomations,
        },
      });
    } catch {
      // silently continue — generation still works
    }

    setIsGenerating(true);
    try {
      const result = await generateStrategyAction(company.id);
      if (result.success) {
        await refreshCompanies();
        toast({
          title: "¡Estrategia generada! 🚀",
          description:
            "Tu estrategia completa está lista. Ve a la página Estrategia.",
        });
        router.push("/estrategia");
      } else {
        toast({
          title: "Error al generar",
          description: result.error || "No se pudo generar la estrategia.",
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error desconocido.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const providerLabels: Record<
    string,
    { name: string; placeholder: string; note: string }
  > = {
    gemini: {
      name: "Google Gemini",
      placeholder: "Deja vacío para usar la key de .env.local",
      note: "Usa GOOGLE_API_KEY del servidor por defecto.",
    },
    claude: {
      name: "Anthropic Claude",
      placeholder: "sk-ant-...",
      note: "Necesitas una API Key de console.anthropic.com",
    },
    openai: {
      name: "OpenAI ChatGPT",
      placeholder: "sk-...",
      note: "Necesitas una API Key de platform.openai.com",
    },
  };

  const networksList = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "youtube", label: "YouTube" },
    { id: "twitter", label: "X (Twitter)" },
  ];

  const toggleNetwork = (id: string) => {
    setTargetNetworks((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-8">
      {/* ── COMPANY CONTEXT SECTION ───────────────────────────────────── */}
      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Contexto de la Empresa
          </h3>
          <p className="text-sm text-gray-500">
            Completa esta información para que la IA entienda perfectamente tu
            negocio antes de generar la estrategia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Sector / Industria</Label>
            <Input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej. Inmobiliaria, Fitness, SaaS..."
            />
          </div>
          <div className="space-y-2">
            <Label>Tono de Voz</Label>
            <Input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="Ej. Profesional, cercano, divertido, autoritario..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descripción del Negocio</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué hace tu empresa? (Descripción detallada)"
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Público Objetivo</Label>
            <Textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="¿A quién ayudas? Ej. Familias jóvenes en Valencia..."
              className="h-20"
            />
          </div>
          <div className="space-y-2">
            <Label>Propuesta Única de Valor (USP)</Label>
            <Textarea
              value={usp}
              onChange={(e) => setUsp(e.target.value)}
              placeholder="¿Qué te diferencia?"
              className="h-20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Recursos para Grabación</Label>
            <Input
              value={contentResources}
              onChange={(e) => setContentResources(e.target.value)}
              placeholder="Ej. Trabajadores, modelos, UGC, voz en off..."
            />
            <p className="text-[11px] text-gray-500">
              ¿Quién o qué saldrá en los videos?
            </p>
          </div>
          <div className="space-y-2">
            <Label>Plan / Límite de Contenido</Label>
            <Input
              value={contentPlan}
              onChange={(e) => setContentPlan(e.target.value)}
              placeholder="Ej. 3 Reels y 2 Carruseles semanales, Sin límite..."
            />
            <p className="text-[11px] text-gray-500">
              Volumen de contenido realista semanal o mensual.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Automatización de Lead Magnet (Manychat, etc.)</Label>
          <Input
            value={manychatAutomations}
            onChange={(e) => setManychatAutomations(e.target.value)}
            placeholder="Ej. Comenta la palabra GUÍA para recibir PDF automático, Menciona X para envío..."
          />
          <p className="text-[11px] text-gray-500">
            Si se define, la IA incluirá CTAs específicos en textos y guiones
            para que comenten estas palabras clave y activen la automatización.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Redes Sociales a utilizar</Label>
          <div className="flex flex-wrap gap-2">
            {networksList.map((net) => (
              <Button
                key={net.id}
                type="button"
                variant={
                  targetNetworks.includes(net.id) ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleNetwork(net.id)}
                className={
                  targetNetworks.includes(net.id)
                    ? "bg-violet-600 hover:bg-violet-700"
                    : ""
                }
              >
                {net.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI GENERATION SECTION ───────────────────────────────────── */}
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
            <Bot className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Generar Estrategia con IA
            </h3>
            <p className="text-sm text-gray-500">
              Conecta un modelo de IA para generar una estrategia completa
              basada en tu empresa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" /> Proveedor de IA
            </Label>
            <Select
              value={aiProvider}
              onValueChange={(v) =>
                setAiProvider(v as "gemini" | "claude" | "openai")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">
                  <span className="flex items-center gap-2">
                    🤖 Google Gemini
                  </span>
                </SelectItem>
                <SelectItem value="claude">
                  <span className="flex items-center gap-2">
                    🧠 Anthropic Claude
                  </span>
                </SelectItem>
                <SelectItem value="openai">
                  <span className="flex items-center gap-2">
                    ⚡ OpenAI ChatGPT
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> API Key{" "}
              {aiProvider === "gemini" && (
                <span className="text-xs text-gray-400">
                  (opcional para Gemini)
                </span>
              )}
            </Label>
            <Input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              placeholder={providerLabels[aiProvider]?.placeholder}
            />
            <p className="text-xs text-violet-600">
              {providerLabels[aiProvider]?.note}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateStrategy}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando estrategia...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generar Estrategia Completa
              </>
            )}
          </Button>

          {company.aiStrategy && (
            <Button
              variant="outline"
              onClick={() => router.push("/estrategia")}
              className="gap-2 text-violet-600 border-violet-200"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Estrategia
            </Button>
          )}
        </div>

        {company.aiStrategy && (
          <p className="text-xs text-gray-400 mt-2">
            Última generación:{" "}
            {new Date(company.aiStrategy.generatedAt).toLocaleString("es-ES")}
          </p>
        )}
      </div>

      <Separator />

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave}>Guardar Contexto</Button>
      </div>
    </div>
  );
}
