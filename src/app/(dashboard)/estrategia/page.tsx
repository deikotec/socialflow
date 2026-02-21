"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { StrategyView } from "@/components/domain/estrategia/StrategyView";
import { Button } from "@/components/ui/button";
import { Lightbulb, Settings } from "lucide-react";
import Link from "next/link";

export default function EstrategiaPage() {
  const { currentCompany, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Selecciona una empresa primero.</p>
      </div>
    );
  }

  if (!currentCompany.aiStrategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[60vh] text-center p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100">
          <Lightbulb className="h-10 w-10 text-violet-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Aún no tienes estrategia generada
          </h2>
          <p className="text-muted-foreground max-w-md">
            Ve a <strong>Configuración → Estrategia</strong>, selecciona un
            proveedor de IA y haz clic en{" "}
            <strong>Generar Estrategia Completa</strong>.
          </p>
        </div>
        <Link href="/settings?tab=strategy">
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Settings className="h-4 w-4" />
            Ir a Configuración
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <StrategyView
      company={currentCompany}
      strategy={currentCompany.aiStrategy}
    />
  );
}
