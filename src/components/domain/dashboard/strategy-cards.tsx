"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FullStrategy } from "@/types";

interface StrategyCardsProps {
  pillars?: FullStrategy["pillars"];
}

export function StrategyCards({ pillars = [] }: StrategyCardsProps) {
  const GRADIENTS = [
    "bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100 text-emerald-900",
    "bg-gradient-to-br from-purple-50 to-fuchsia-50 border-fuchsia-100 text-purple-900",
    "bg-gradient-to-br from-orange-50 to-amber-50 border-amber-100 text-amber-900",
    "bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-100 text-cyan-900",
    "bg-gradient-to-br from-pink-50 to-rose-50 border-rose-100 text-rose-900",
  ];

  const TEXT_COLORS = [
    "text-emerald-600",
    "text-purple-600",
    "text-amber-600",
    "text-cyan-600",
    "text-rose-600",
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif font-semibold text-foreground">
        Estrategia Mensual
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((pillar, idx) => (
          <Card
            key={idx}
            className={cn(
              "border shadow-sm flex flex-col justify-center text-center py-6",
              GRADIENTS[idx % GRADIENTS.length],
            )}
          >
            <CardContent className="p-0 space-y-2">
              <div
                className={cn(
                  "text-5xl font-bold tracking-tighter",
                  TEXT_COLORS[idx % TEXT_COLORS.length],
                )}
              >
                {pillar.percentage}%
              </div>
              <div className="font-bold uppercase tracking-wider text-sm opacity-80 truncate px-2">
                {pillar.name.toUpperCase()}
              </div>

              <div className="text-sm font-medium opacity-90 pb-2">
                {pillar.desc}
              </div>

              <div className="flex flex-wrap justify-center gap-1 px-4 mt-2">
                {pillar.examples?.slice(0, 5).map((kw, kIdx) => (
                  <span key={kIdx} className="text-xs opacity-70 font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Summary Strip (Visual Decoration for now) */}
      <div className="flex flex-wrap gap-3 items-center text-sm font-medium text-muted-foreground pb-2">
        {pillars.slice(0, 3).map((s, i) => (
          <Badge key={i} variant="secondary" className="bg-gray-50">
            ● {s.name} ({s.percentage}%)
          </Badge>
        ))}
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700"
        >
          🎥 Grabación: Semanal
        </Badge>
      </div>
    </div>
  );
}
