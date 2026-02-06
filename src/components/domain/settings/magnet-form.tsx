"use client";

import { useState } from "react";
import { Company, LeadMagnet } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateCompany } from "@/actions/company-actions";
import { useAuth } from "@/components/providers/auth-provider";

interface MagnetFormProps {
  company: Company;
}

export function MagnetForm({ company }: MagnetFormProps) {
  const { refreshCompanies } = useAuth();
  const [magnets, setMagnets] = useState<LeadMagnet[]>(
    company.leadMagnets || [],
  );
  const [newTitle, setNewTitle] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newType, setNewType] = useState<LeadMagnet["type"]>("pdf");

  const { toast } = useToast();

  const handleAdd = () => {
    if (!newTitle || !newKeyword) return;
    const newMagnet: LeadMagnet = {
      id: crypto.randomUUID(),
      title: newTitle,
      keyword: newKeyword.toUpperCase(),
      subtitle: newType === "pdf" ? "PDF Automatizado" : "Recurso",
      type: newType,
    };
    setMagnets([...magnets, newMagnet]);
    setNewTitle("");
    setNewKeyword("");
  };

  const handleSave = async () => {
    try {
      await updateCompany(company.id, { leadMagnets: magnets });
      await refreshCompanies();
      toast({ title: "Lead Magnets actualizados" });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    }
  };

  const removeMagnet = (id: string) => {
    setMagnets(magnets.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2 md:col-span-1">
          <Label>Keyword (ManyChat)</Label>
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Ej. GUIA2025"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Título del Recurso</Label>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej. Informe de Mercado"
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <Label>Tipo</Label>
          <Select
            value={newType}
            onValueChange={(v) => setNewType(v as LeadMagnet["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="checklist">Checklist</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={handleAdd}
        disabled={!newKeyword || !newTitle}
        className="w-full"
      >
        Añadir Lead Magnet
      </Button>

      <div className="space-y-4">
        {magnets.map((magnet) => (
          <Card key={magnet.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">KEYWORD: {magnet.keyword}</p>
                <p>{magnet.title}</p>
                <p className="text-xs text-muted-foreground uppercase">
                  {magnet.type}
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-red-500"
                onClick={() => removeMagnet(magnet.id)}
              >
                Eliminar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {magnets.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      )}
    </div>
  );
}
