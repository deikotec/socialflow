import { useState } from "react";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Ensure this component exists or use simple textarea
import { updateCompany } from "@/actions/company-actions";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface GeneralFormProps {
  company: Company;
}

export function GeneralForm({ company }: GeneralFormProps) {
  const { refreshCompanies } = useAuth();
  const [name, setName] = useState(company.name);
  const [website, setWebsite] = useState(company.settings?.website || "");
  const [instagram, setInstagram] = useState(company.settings?.instagram || "");
  const [brandColor, setBrandColor] = useState(
    company.settings?.brandColor || "#ffffff",
  );

  // Extended Fields
  const [sector, setSector] = useState(company.sector || "");
  const [description, setDescription] = useState(company.description || "");
  const [targetAudience, setTargetAudience] = useState(
    company.targetAudience || "",
  );
  const [usp, setUsp] = useState(company.usp || "");
  const [tone, setTone] = useState(company.tone || "");

  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateCompany(company.id, {
        name,
        settings: { website, instagram, brandColor },
        sector,
        description,
        targetAudience,
        usp,
        tone,
      });
      await refreshCompanies();
      toast({
        title: "Guardado",
        description: "Información general actualizada.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nombre de la Empresa</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Sector / Industria</Label>
          <Input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Ej. Inmobiliaria, Fitness, SaaS..."
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

      <div className="space-y-2">
        <Label>Tono de Voz</Label>
        <Input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Ej. Profesional, cercano, divertido, autoritario..."
        />
      </div>

      <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Sitio Web</Label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>Instagram / Redes</Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@usuario"
          />
        </div>

        <div className="space-y-2">
          <Label>Color de Marca</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
