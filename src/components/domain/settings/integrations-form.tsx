"use client";

import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Video, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface IntegrationsFormProps {
  company: Company;
}

export function IntegrationsForm({ company }: IntegrationsFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      if (typeof date === "string") return new Date(date).toLocaleDateString();
      if (date.seconds)
        return new Date(date.seconds * 1000).toLocaleDateString(); // Firestore Timestamp
      if (date instanceof Date) return date.toLocaleDateString();
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  const handleConnect = (platform: "instagram" | "tiktok") => {
    setLoading(platform);

    // Redirect to API Auth Route
    if (platform === "instagram") {
      window.location.href = `/api/auth/meta/login?companyId=${company.id}`;
    } else if (platform === "tiktok") {
      window.location.href = `/api/auth/tiktok/login?companyId=${company.id}`;
    }
  };

  const isInstagramConnected =
    !!company.socialConnections?.instagram?.accessToken;
  const isTikTokConnected = !!company.socialConnections?.tiktok?.accessToken;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Instagram / Meta */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-2 rounded-lg text-white">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Instagram & Facebook</CardTitle>
                <CardDescription>
                  Publicación automática de Reels y Posts.
                </CardDescription>
              </div>
            </div>
            {isInstagramConnected ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500">
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isInstagramConnected ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Página:</strong>{" "}
                {company.socialConnections?.instagram?.username ||
                  "Desconocido"}
              </p>
              <p className="text-xs text-slate-400">
                Última actualización:{" "}
                {formatDate(company.socialConnections?.instagram?.updatedAt)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Conecta tu cuenta de empresa de Instagram (vinculada a una Fanpage
              de Facebook) para habilitar la programación automática.
            </p>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-4">
          {isInstagramConnected ? (
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Desconectar
            </Button>
          ) : (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleConnect("instagram")}
              disabled={!!loading}
            >
              {loading === "instagram"
                ? "Conectando..."
                : "Conectar con Facebook"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* TikTok */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-lg text-white">
                <div className="w-6 h-6 flex items-center justify-center font-bold">
                  Tn
                </div>
                {/* Replacing Icon with Text or custom SVG if needed, using Video generic for now or text */}
              </div>
              <div>
                <CardTitle>TikTok</CardTitle>
                <CardDescription>
                  Publicación directa de videos.
                </CardDescription>
              </div>
            </div>
            {isTikTokConnected ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500">
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isTikTokConnected ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Usuario:</strong>{" "}
                {company.socialConnections?.tiktok?.username || "Desconocido"}
              </p>
              <p className="text-xs text-slate-400">
                Expira en:{" "}
                {Math.floor(
                  (company.socialConnections?.tiktok?.expiresIn || 0) / 3600,
                )}{" "}
                horas
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Conecta tu cuenta de Business o Creator de TikTok para publicar
              videos sin usar el móvil.
            </p>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-4">
          {isTikTokConnected ? (
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Desconectar
            </Button>
          ) : (
            <Button
              className="w-full bg-black hover:bg-zinc-800 text-white"
              onClick={() => handleConnect("tiktok")}
              disabled={!!loading}
            >
              {loading === "tiktok" ? "Conectando..." : "Conectar TikTok"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
