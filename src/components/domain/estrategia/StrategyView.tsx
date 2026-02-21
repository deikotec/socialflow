"use client";

import { Company, FullStrategy, ContentLibraryItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  Settings,
  ExternalLink,
  Instagram,
  Linkedin,
  Video,
  Images,
  FileText,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  generateStrategyAction,
  regenerateSingleIdeaAction,
  toggleIdeaUsedAction,
  regenerateMonthlyContentAction,
} from "@/actions/strategy-actions";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface StrategyViewProps {
  company: Company;
  strategy: FullStrategy;
}

// ── Color map for bg classes (like c1.html) ────────────────────────────────
const bgClasses: Record<string, string> = {
  "bg-dark-text": "bg-gradient-to-br from-gray-900 to-gray-800 text-white",
  "bg-sun-warm": "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
  "bg-sky-deep": "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
  "bg-white-clean": "border border-gray-200 bg-white text-gray-900",
  "bg-green-nature":
    "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white",
  "bg-sun-light":
    "bg-gradient-to-br from-yellow-50 to-amber-100 text-amber-800",
  "bg-sky-light": "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700",
  "bg-contrast": "bg-gradient-to-br from-stone-100 to-stone-200 text-gray-900",
  "bg-soft-green":
    "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700",
};

const channelColor: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok: "bg-gray-100 text-gray-800",
  linkedin: "bg-blue-100 text-blue-700",
  youtube: "bg-red-100 text-red-700",
};

const channelIcon = (ch: string) => {
  if (ch === "instagram") return <Instagram className="w-3 h-3" />;
  if (ch === "linkedin") return <Linkedin className="w-3 h-3" />;
  if (ch === "tiktok") return <Video className="w-3 h-3" />;
  return <ExternalLink className="w-3 h-3" />;
};

const formatIcon = (fmt: string) => {
  if (fmt === "carousel") return <Images className="w-3 h-3" />;
  if (fmt === "reel") return <Video className="w-3 h-3" />;
  if (fmt === "story") return <Smartphone className="w-3 h-3" />;
  if (fmt === "linkedin_post") return <Linkedin className="w-3 h-3" />;
  return <FileText className="w-3 h-3" />;
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ContentLibraryCard({
  item,
  idx,
  company,
}: {
  item: ContentLibraryItem;
  idx: number;
  company: Company;
}) {
  const [open, setOpen] = useState(idx === 0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { refreshCompanies } = useAuth();
  const { toast } = useToast();

  const handleToggleUsed = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsToggling(true);
    const newValue = e.target.checked;
    try {
      const result = await toggleIdeaUsedAction(company.id, idx, newValue);
      if (result.success) {
        await refreshCompanies();
        toast({
          title: newValue ? "Marcada como usada" : "Desmarcada",
          description: "Estado actualizado correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRegenerating(true);
    try {
      const result = await regenerateSingleIdeaAction(company.id, idx);
      if (result.success) {
        await refreshCompanies();
        toast({
          title: "Idea regenerada ✨",
          description: "La idea fue reemplazada exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-stone-50 border-b border-gray-100 px-6 py-5 flex items-start gap-4">
        <span className="text-xs font-bold text-gray-400 bg-stone-200 rounded-lg px-2.5 py-1 shrink-0 mt-0.5">
          #{String(idx + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-[15px] leading-snug mb-2">
            {item.title}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-0.5 ${
                item.type === "carousel"
                  ? "bg-amber-100 text-amber-700"
                  : item.type === "reel"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {item.type === "carousel"
                ? "🟧"
                : item.type === "reel"
                  ? "🎬"
                  : "💼"}{" "}
              {item.type === "carousel"
                ? "Carrusel"
                : item.type === "reel"
                  ? "Reel / TikTok"
                  : "LinkedIn"}
            </span>
            {item.channels.map((ch) => (
              <span
                key={ch}
                className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-0.5 ${channelColor[ch] || "bg-gray-100 text-gray-700"}`}
              >
                {channelIcon(ch)} {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-0.5 bg-emerald-50 text-emerald-700">
              🎯 {item.pillar}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors mr-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
              checked={item.isUsed || false}
              onChange={handleToggleUsed}
              disabled={isToggling}
              onClick={(e) => e.stopPropagation()}
            />
            {item.isUsed ? "✅ Usada" : "En espera"}
          </label>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            title="Regenerar esta idea con IA"
            className="text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1.5"
          >
            <RefreshCcw
              className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`}
            />
            {isRegenerating ? "Generando..." : "Regenerar"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            {open ? "Cerrar ▲" : "Ver ▼"}
          </button>
        </div>
      </div>

      {/* Engagement targets */}
      <div className="flex flex-wrap gap-3 px-6 py-3 border-b border-gray-100 bg-amber-50/30">
        {item.engTargets.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-xs text-gray-500"
          >
            <span>{t.icon}</span>
            <strong className="text-gray-800">{t.label}:</strong> {t.desc}
          </div>
        ))}
      </div>

      {open && (
        <div className="px-6 py-5 space-y-5">
          {/* Strategy note */}
          <div className="border-l-4 border-emerald-500 bg-emerald-50 rounded-r-lg px-4 py-3 text-sm text-emerald-800">
            <strong>Estrategia:</strong> {item.strategyNote}
          </div>

          {/* CAROUSEL slides */}
          {item.type === "carousel" && item.slides && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Estructura de slides ({item.slides.length} slides)
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.slides.map((slide, si) => (
                  <div
                    key={si}
                    className={`shrink-0 w-44 min-h-[180px] rounded-xl p-4 flex flex-col justify-between border ${
                      bgClasses[slide.bg] || bgClasses["bg-white-clean"]
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                      {slide.num}
                    </div>
                    {slide.role && (
                      <div className="text-[10px] font-bold uppercase tracking-wide opacity-55 mb-1">
                        {slide.role}
                      </div>
                    )}
                    <div className="font-bold text-sm leading-snug flex-1 flex items-center">
                      {slide.text}
                    </div>
                    {slide.subtext && (
                      <div className="text-[11px] opacity-75 mt-2">
                        {slide.subtext}
                      </div>
                    )}
                    {slide.cta && (
                      <div className="mt-2 text-[11px] font-bold bg-white/20 rounded-lg px-2 py-1 inline-block">
                        → {slide.cta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REEL scenes */}
          {item.type === "reel" && item.scenes && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-stone-50 border border-gray-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Duración
                  </div>
                  <div className="text-sm font-semibold">
                    {item.duration || "30-45s"}
                  </div>
                </div>
                <div className="bg-stone-50 border border-gray-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Formato
                  </div>
                  <div className="text-sm font-semibold">
                    {item.ratio || "9:16"}
                  </div>
                </div>
                <div className="bg-stone-50 border border-gray-100 rounded-xl p-3 col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                    Música
                  </div>
                  <div className="text-sm font-semibold">
                    {item.music || "Trending TikTok"}
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Escenas
              </p>
              <div className="space-y-3">
                {item.scenes.map((scene, si) => (
                  <div
                    key={si}
                    className="grid grid-cols-[52px_1fr] gap-3 items-start"
                  >
                    <div className="bg-amber-400 text-white rounded-xl p-2 text-center">
                      <div className="text-[10px] font-bold uppercase">
                        ESC.
                      </div>
                      <div className="font-bold text-sm">{scene.sceneNum}</div>
                      <div className="text-[10px]">{scene.timeRange}</div>
                    </div>
                    <div className="bg-stone-50 border border-gray-100 rounded-xl p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
                        {scene.phase} — {scene.timeRange}
                      </div>
                      <div className="font-semibold text-sm mb-1">
                        {scene.what}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {scene.how}
                      </div>
                      <span className="inline-block text-[11px] bg-amber-100 text-amber-800 rounded px-2 py-0.5 font-medium">
                        {scene.textOverlay}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {item.script && (
                <div className="bg-gray-900 rounded-xl p-5 text-sm space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-3">
                    🎙 Guion
                  </div>
                  <p className="text-amber-300 font-semibold">
                    &quot;{item.script.hook}&quot;
                  </p>
                  <hr className="border-white/10" />
                  <p className="text-stone-200">{item.script.body}</p>
                  <hr className="border-white/10" />
                  <p className="text-emerald-300 font-semibold">
                    &quot;{item.script.cta}&quot;
                  </p>
                </div>
              )}
            </>
          )}

          {/* LINKEDIN post */}
          {item.type === "linkedin" && item.linkedinPost && (
            <div className="bg-[#f3f6f9] border border-[#d9e3ec] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  {company?.name?.charAt(0) || "C"}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {company?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {company?.sector || "Empresa"}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {item.linkedinPost}
              </div>
              <div className="mt-3 text-xs text-blue-600">
                {item.linkedinHashtags}
              </div>
              <div className="flex gap-4 mt-4 pt-3 border-t border-[#d9e3ec] text-xs text-gray-500">
                <span>👍 Me gusta</span>
                <span>💬 Comentar</span>
                <span>↗️ Compartir</span>
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-2">
              📋 Caption
            </div>
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {item.caption}
            </div>
            <div className="text-xs text-blue-500 mt-2">{item.hashtags}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main StrategyView ──────────────────────────────────────────────────────

export function StrategyView({ company, strategy }: StrategyViewProps) {
  const { refreshCompanies } = useAuth();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingMonth, setIsRegeneratingMonth] = useState(false);

  const handleRegenerateMonth = async () => {
    setIsRegeneratingMonth(true);
    try {
      const result = await regenerateMonthlyContentAction(company.id);
      if (result.success) {
        await refreshCompanies();
        toast({
          title: "Nuevo lote generado ✨",
          description:
            "Las ideas han sido renovadas manteniendo tu estrategia.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingMonth(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await generateStrategyAction(company.id);
      if (result.success) {
        await refreshCompanies();
        toast({ title: "Estrategia regenerada ✨" });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  // Calendar day column colors
  const dayColors: Record<string, string> = {
    instagram: "bg-pink-50 border-l-2 border-pink-400 text-pink-700",
    tiktok: "bg-gray-100 border-l-2 border-gray-500 text-gray-700",
    linkedin: "bg-blue-50 border-l-2 border-blue-400 text-blue-700",
  };

  const funnelBgMap: Record<string, string> = {
    "#4A90E2": "border-t-[3px] border-blue-400",
    "#f5a623": "border-t-[3px] border-amber-400",
    "#2ECC71": "border-t-[3px] border-emerald-400",
    blue: "border-t-[3px] border-blue-400",
    amber: "border-t-[3px] border-amber-400",
    green: "border-t-[3px] border-emerald-400",
  };

  const getFunnelBorder = (color: string) =>
    funnelBgMap[color] || "border-t-[3px] border-violet-400";

  const roadmapBorderMap: Record<string, string> = {
    "#4A90E2": "border-t-blue-400",
    "#f5a623": "border-t-amber-400",
    "#2ECC71": "border-t-emerald-400",
  };
  const getRoadmapBorder = (color: string) =>
    roadmapBorderMap[color] || "border-t-violet-400";

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-8 space-y-12">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-amber-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
            ✨ Estrategia de Contenido IA
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-none mb-3">
            Contenido que <span className="text-amber-500">Conecta</span> y{" "}
            <span className="text-blue-600">Convierte</span>
          </h1>
          <p className="text-gray-500 text-base max-w-xl leading-relaxed">
            {strategy.summary}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm min-w-[200px]">
          <div className="text-xl font-bold text-blue-600">{company.name}</div>
          <div className="text-sm text-gray-500 mt-1">
            {company.sector || "Empresa"}
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {strategy.targetChannels.map((ch) => (
              <span
                key={ch}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 ${channelColor[ch] || "bg-gray-100 text-gray-700"}`}
              >
                {channelIcon(ch)} {ch}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              size="sm"
              variant="default"
              onClick={handleRegenerateMonth}
              disabled={isRegeneratingMonth}
              className="gap-1 text-xs w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCcw
                className={`h-3 w-3 ${isRegeneratingMonth ? "animate-spin" : ""}`}
              />
              {isRegeneratingMonth
                ? "Generando lote..."
                : "Generar Lote Nuevo Mes"}
            </Button>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="gap-1 text-xs flex-1"
              >
                <RefreshCcw
                  className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`}
                />
                {isRegenerating ? "..." : "Regenerar Todo"}
              </Button>
              <Link href="/settings" className="flex-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs w-full"
                >
                  <Settings className="h-3 w-3" /> Config
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Generado:{" "}
            {new Date(strategy.generatedAt).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2">
        {strategy.targetChannels.map((ch) => (
          <span
            key={ch}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm"
          >
            <span
              className={`w-2 h-2 rounded-full ${ch === "instagram" ? "bg-pink-500" : ch === "tiktok" ? "bg-gray-800" : ch === "linkedin" ? "bg-blue-500" : "bg-red-500"}`}
            />
            {ch.charAt(0).toUpperCase() + ch.slice(1)}
          </span>
        ))}
      </div>

      {/* ── BUSINESS INSIGHTS ──────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
          Contexto de negocio
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {strategy.insights.map((ins, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm hover:-translate-y-1 transition-transform"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: [
                  "#f5a623",
                  "#1a6faf",
                  "#2e7d52",
                  "#c97d00",
                  "#1a6faf",
                ][i % 5],
              }}
            >
              <div className="text-2xl mb-2">{ins.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {ins.label}
              </div>
              <div className="font-bold text-lg text-gray-900 leading-tight">
                {ins.value}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">{ins.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTENT PILLARS ────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
          Pilares de contenido
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategy.pillars.map((p, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-[22px] p-6 shadow-sm hover:-translate-y-1.5 hover:shadow-md transition-all relative overflow-hidden"
              style={{ borderTopWidth: "4px", borderTopColor: p.color }}
            >
              <span className="text-3xl block mb-3">{p.icon}</span>
              <div className="font-bold text-[15px] mb-2">{p.name}</div>
              <div className="text-sm text-gray-500 leading-snug mb-3">
                {p.desc}
              </div>
              <div className="space-y-1 mb-3">
                {p.examples.map((ex, ei) => (
                  <div
                    key={ei}
                    className="text-[11px] text-gray-500 pl-3.5 relative before:content-['☀'] before:absolute before:left-0 before:text-[9px] leading-snug"
                    style={{ "--before-color": p.color } as React.CSSProperties}
                  >
                    {ex}
                  </div>
                ))}
              </div>
              <span
                className="text-[12px] font-bold rounded-full px-3 py-1 inline-block"
                style={{ backgroundColor: p.color + "20", color: p.color }}
              >
                {p.percentage}% del contenido
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTENT IDEAS TABLE ─────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
          {strategy.contentIdeas.length} ideas de contenido listas para publicar
        </p>
        <div className="bg-white border border-gray-100 rounded-[22px] overflow-hidden shadow-sm">
          <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr] px-5 py-3 bg-stone-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <div>Idea de contenido</div>
            <div>Canal</div>
            <div>Formato</div>
            <div>Pilar</div>
          </div>
          {strategy.contentIdeas.map((idea, i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr] px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-stone-50 transition-colors items-center gap-3"
            >
              <div className="text-sm font-medium leading-snug">
                {idea.idea}
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${channelColor[idea.channel] || "bg-gray-100 text-gray-700"}`}
                >
                  {channelIcon(idea.channel)} {idea.channel}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {formatIcon(idea.format)}{" "}
                <span>{idea.format.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-emerald-50 text-emerald-700">
                  {idea.pillar}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WEEKLY CALENDAR ─────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
          Calendario semanal tipo
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {strategy.weeklyCalendar.map((day, di) => (
            <div
              key={di}
              className="bg-white border border-gray-100 rounded-[18px] p-3 min-h-[120px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                {day.day}
              </div>
              <div className="space-y-1.5">
                {day.posts.length === 0 ? (
                  <span className="text-[10px] text-gray-300 italic">
                    Descanso
                  </span>
                ) : (
                  day.posts.map((p, pi) => (
                    <div
                      key={pi}
                      className={`block rounded-lg px-2 py-1.5 text-[10px] font-medium leading-snug border-l-2 ${
                        dayColors[p.channel] ||
                        "bg-gray-100 border-l-gray-400 text-gray-700"
                      }`}
                    >
                      {p.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
          KPIs objetivo
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {strategy.kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm hover:-translate-y-1 transition-transform text-center"
            >
              <div className="text-3xl mb-3">{kpi.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {kpi.label}
              </div>
              <div className="font-bold text-2xl text-blue-600 mb-1">
                {kpi.value}
              </div>
              <div className="text-[11px] text-gray-500">{kpi.target}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROADMAP ──────────────────────────────────────────────────── */}
      {strategy.roadmap && strategy.roadmap.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
            Hoja de ruta — 6 meses
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {strategy.roadmap.map((phase, i) => (
              <div
                key={i}
                className={`bg-white border border-gray-100 rounded-[22px] p-7 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all border-t-4 ${getRoadmapBorder(phase.color)}`}
              >
                <div
                  className="text-[11px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: phase.color }}
                >
                  {phase.phase}
                </div>
                <div className="font-bold text-[18px] mb-1">{phase.title}</div>
                <div className="text-sm text-gray-400 italic mb-4">
                  {phase.period}
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, ii) => (
                    <li
                      key={ii}
                      className="text-[12.5px] text-gray-500 pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-[11px] leading-snug"
                      style={
                        { "--arrow-color": phase.color } as React.CSSProperties
                      }
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTENT LIBRARY ─────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
          Biblioteca de contenido detallada
        </p>
        <div className="space-y-5">
          {strategy.contentLibrary.map((item, i) => (
            <ContentLibraryCard
              key={item.id || i}
              item={item}
              idx={i}
              company={company}
            />
          ))}
        </div>
      </section>

      {/* ── INSTAGRAM STORIES FUNNEL ────────────────────────────────── */}
      {strategy.storiesFunnel && strategy.storiesFunnel.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-100">
            Estrategia de historias Instagram — Embudo
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
            {strategy.storiesFunnel.map((phase, i) => (
              <div
                key={i}
                className={`bg-[#0E1A2E] p-10 relative overflow-hidden transition-colors hover:bg-[#162236] ${
                  i === 0
                    ? "rounded-l-[16px]"
                    : i === strategy.storiesFunnel.length - 1
                      ? "rounded-r-[16px]"
                      : ""
                } ${getFunnelBorder(phase.color)}`}
              >
                <div className="absolute top-4 right-5 text-[80px] font-black opacity-[0.06] leading-none">
                  {i + 1}
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-[4px] mb-4"
                  style={{ color: phase.color }}
                >
                  {phase.phase}
                </div>
                <h3 className="text-[28px] font-black tracking-wide text-white mb-2">
                  {phase.title}
                </h3>
                <div
                  className="inline-block text-[10px] font-bold uppercase tracking-[3px] px-3 py-1 rounded mb-4"
                  style={{
                    backgroundColor: phase.color + "20",
                    color: phase.color,
                  }}
                >
                  {phase.objective}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">
                  {phase.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {phase.days.map((d, di) => (
                    <span
                      key={di}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded bg-white/10 text-white/80"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-100">
        Generado el{" "}
        {new Date(strategy.generatedAt).toLocaleString("es-ES", {
          dateStyle: "long",
          timeStyle: "short",
        })}{" "}
        con IA para <strong className="text-amber-500">{company.name}</strong>.{" "}
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="underline hover:text-gray-600 ml-1"
        >
          Actualizar estrategia
        </button>
      </div>
    </div>
  );
}
