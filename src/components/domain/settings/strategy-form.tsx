"use client";

import { useState } from "react";
import { Company, StrategyBlock } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { updateCompany } from "@/actions/company-actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Video,
  Images,
  Image as ImageIcon,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StrategyFormProps {
  company: Company;
}

export function StrategyForm({ company }: StrategyFormProps) {
  const { refreshCompanies } = useAuth();

  const [weeklyPostCount, setWeeklyPostCount] = useState<number>(
    company.settings?.weeklyPostCount || 7,
  );

  const [strategies, setStrategies] = useState<StrategyBlock[]>(
    company.strategy && company.strategy.length > 0
      ? company.strategy
      : [
          {
            title: "Valor",
            percentage: 70,
            type: "Valor",
            keywords: [],
            formats: ["reel"],
          },
          {
            title: "Viral",
            percentage: 20,
            type: "Viral",
            keywords: [],
            formats: ["reel", "carousel"],
          },
          {
            title: "Venta",
            percentage: 10,
            type: "Venta",
            keywords: [],
            formats: ["story"],
          },
        ],
  );

  const { toast } = useToast();

  const totalPercentage = strategies.reduce(
    (acc, curr) => acc + curr.percentage,
    0,
  );

  const handleAddPillar = () => {
    setStrategies([
      ...strategies,
      {
        title: "Nuevo Pilar",
        percentage: 0,
        type: "Nuevo",
        keywords: [],
        formats: ["static"],
      },
    ]);
  };

  const handleRemovePillar = (index: number) => {
    setStrategies(strategies.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: keyof StrategyBlock,
    value: any,
  ) => {
    const newStrategies = [...strategies];
    newStrategies[index] = { ...newStrategies[index], [field]: value };
    // Sync title with type for simplicity
    if (field === "type") {
      newStrategies[index].title = value;
    }
    setStrategies(newStrategies);
  };

  const handleKeywordAdd = (index: number, keyword: string) => {
    if (!keyword) return;
    const newStrategies = [...strategies];
    if (!newStrategies[index].keywords.includes(keyword)) {
      newStrategies[index].keywords.push(keyword);
      setStrategies(newStrategies);
    }
  };

  const removeKeyword = (index: number, keyword: string) => {
    const newStrategies = [...strategies];
    newStrategies[index].keywords = newStrategies[index].keywords.filter(
      (k) => k !== keyword,
    );
    setStrategies(newStrategies);
  };

  const handleSave = async () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Atención",
        description: `El total de porcentajes debe ser 100%. Actual: ${totalPercentage}%`,
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCompany(company.id, {
        strategy: strategies,
        settings: { ...company.settings, weeklyPostCount },
      });
      await refreshCompanies();
      toast({ title: "Estrategia actualizada" });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    }
  };

  const calculatePosts = (percentage: number) => {
    return Math.round((percentage / 100) * weeklyPostCount);
  };

  return (
    <div className="space-y-8">
      {/* Global Settings */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <Label className="text-lg font-semibold mb-2 block">
          Frecuencia de Publicación Semanal
        </Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={weeklyPostCount}
            onChange={(e) => setWeeklyPostCount(parseInt(e.target.value) || 0)}
            className="w-24 text-center text-lg font-bold"
            min={1}
          />
          <span className="text-muted-foreground">posts por semana</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Se generarán aproximadamente {weeklyPostCount * 4} piezas de contenido
          al mes.
        </p>
      </div>

      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-900">
            Total Distribuido:
          </span>
          <span
            className={`font-bold text-xl ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}
          >
            {totalPercentage}%
          </span>
        </div>
        {totalPercentage !== 100 && (
          <div className="flex items-center text-sm text-red-600 gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Ajusta para llegar al 100%</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {strategies.map((block, idx) => (
          <div
            key={idx}
            className="border p-4 rounded-lg bg-white shadow-sm space-y-4 relative group"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Nombre del Pilar</Label>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                    ~ {calculatePosts(block.percentage)} posts/semana
                  </Badge>
                </div>
                <Input
                  value={block.type}
                  onChange={(e) => handleUpdate(idx, "type", e.target.value)}
                  className="font-bold text-lg"
                />
              </div>
              <div className="w-1/3 space-y-2">
                <Label>Porcentaje ({block.percentage}%)</Label>
                <Slider
                  value={[block.percentage]}
                  max={100}
                  step={5}
                  onValueChange={(val) =>
                    handleUpdate(idx, "percentage", val[0])
                  }
                />
              </div>
              {strategies.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePillar(idx)}
                  className="text-gray-400 hover:text-red-500 mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formatos Preferidos</Label>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={block.formats || []}
                  onValueChange={(val) => handleUpdate(idx, "formats", val)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="reel" aria-label="Reels">
                    <Video className="h-4 w-4 mr-2" /> Reel
                  </ToggleGroupItem>
                  <ToggleGroupItem value="carousel" aria-label="Carrusel">
                    <Images className="h-4 w-4 mr-2" /> Carrusel
                  </ToggleGroupItem>
                  <ToggleGroupItem value="static" aria-label="Post">
                    <ImageIcon className="h-4 w-4 mr-2" /> Post
                  </ToggleGroupItem>
                  <ToggleGroupItem value="story" aria-label="Story">
                    <Smartphone className="h-4 w-4 mr-2" /> Story
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label>Palabras Clave / Temáticas</Label>
                <Input
                  placeholder="Añadir palabra clave..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleKeywordAdd(idx, e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {block.keywords.map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeKeyword(idx, k)}
                    >
                      {k} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={handleAddPillar}>
          <Plus className="w-4 h-4 mr-2" /> Añadir Nuevo Pilar
        </Button>
        <Button onClick={handleSave} disabled={totalPercentage !== 100}>
          Guardar Estrategia
        </Button>
      </div>
    </div>
  );
}
