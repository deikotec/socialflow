"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LeadMagnet } from "@/types";
import { Download, CheckCircle2, Bot } from "lucide-react";

interface LeadMagnetsProps {
  magnets: LeadMagnet[];
}

export function LeadMagnets({ magnets }: LeadMagnetsProps) {
  return (
    <Card className="bg-slate-900 text-white overflow-hidden relative border-none shadow-xl">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Bot className="h-32 w-32" />
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-2 mb-6 text-amber-400">
          <Bot className="h-5 w-5" />
          <h3 className="font-bold text-lg tracking-wide">
            ManyChat Lead Magnets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          {magnets.map((magnet) => (
            <div
              key={magnet.id}
              className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors group cursor-pointer"
            >
              <div className="text-[10px] font-mono text-amber-200 uppercase tracking-widest mb-1 opacity-80">
                KEYWORD: &quot;{magnet.keyword}&quot;
              </div>
              <div className="font-semibold text-lg text-white mb-2 leading-tight">
                {magnet.title}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                {magnet.type === "pdf" ? (
                  <Download className="h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                <span>{magnet.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
