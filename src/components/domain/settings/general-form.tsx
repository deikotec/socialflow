import { useState } from "react";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCompany } from "@/actions/company-actions";
import { generateAuthUrlAction } from "@/actions/integration-actions";
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

  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateCompany(company.id, {
        name,
        settings: { website, instagram, brandColor },
      });
      await refreshCompanies();
      toast({
        title: "Guardado",
        description: "Información general actualizada.",
      });
    } catch (_e) {
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

      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-medium">Integraciones</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded shadow-sm">
              {/* Simple Drive Icon */}
              <svg
                className="w-6 h-6"
                viewBox="0 0 87.3 78"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                  fill="#ea4335"
                />
                <path
                  d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44.05c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
                  fill="#fbbc04"
                />
                <path
                  d="m43.65 25 13.75 23.8-13.75 23.8h-27.5c0 1.55.4 3.1 1.2 4.5l25.4 44.05c1.35.8 2.5 1.9 3.3 3.3z"
                  fill="#34a853"
                />
                <path
                  d="m43.65 25h27.5c0-1.55-.4-3.1-1.2-4.5l-13.75-23.8c-1.35-.8-2.5-1.9-3.3-3.3h-27.5z"
                  fill="#4285f4"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Google Drive</div>
              <div className="text-sm text-gray-500">
                {company.drive_refresh_token
                  ? "Conectado y listo para sincronizar archivos."
                  : "Conecta tu cuenta para subir archivos directamente."}
              </div>
            </div>
          </div>
          {company.drive_refresh_token ? (
            <Button
              variant="outline"
              disabled
              className="text-green-600 border-green-200 bg-green-50"
            >
              ✅ Conectado
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={async () => {
                const url = await generateAuthUrlAction(company.id);
                if (url) window.location.href = url;
              }}
            >
              Conectar Drive
            </Button>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
